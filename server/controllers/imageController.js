import axios from "axios";
import fs from "fs";
import History from "../models/History.js";
import User from "../models/User.js";
import { deductToolCredits } from "../utils/creditHelper.js";

// Helper to fetch binary image data and convert to base64
async function fetchImageBuffer(url, timeoutMs = 9000) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/jpeg,image/png,image/webp,image/*;q=0.9,*/*;q=0.8"
      },
      timeout: timeoutMs
    });

    const contentType = (res.headers["content-type"] || "image/jpeg").toLowerCase();
    if (contentType.startsWith("image/") && res.data && res.data.length > 500) {
      const mimeType = contentType.split(";")[0].trim() || "image/jpeg";
      const base64 = Buffer.from(res.data).toString("base64");
      return { mimeType, base64 };
    }
  } catch (err) {
    // Return null to allow next fallback
  }
  return null;
}

export const generateImage = async (req, res) => {
  let userId = null;
  try {
    // Log incoming request
    const logEntry = `[${new Date().toISOString()}] Incoming Request:\nHeaders: ${JSON.stringify(req.headers)}\nBody: ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync('debug_image.txt', logEntry);
    console.log("Image Gen Request:", req.body);

    const { prompt, size = "512x512" } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }
    userId = req.user.id;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Credits usage check (5 credits per image, 20 credits/day max on Basic = 4 images/day)
    const creditResult = await deductToolCredits(user, "image");
    if (!creditResult.success) {
      return res.status(403).json({
        success: false,
        outOfCredits: true,
        message: creditResult.message,
        remainingCredits: creditResult.remainingCredits,
        maxCredits: creditResult.maxCredits,
        freeCreditsResetAt: creditResult.freeCreditsResetAt,
        tool: "image",
      });
    }

    // ---------------------------------------------------------------
    // Extract art style prefix sent by frontend ("Anime style: cat")
    // and map it to Pollinations model + quality enhancement keywords
    // ---------------------------------------------------------------
    const STYLE_MAP = {
      "photorealistic": {
        model: "flux",
        enhance: "ultra realistic, photorealistic, DSLR, 8k resolution, sharp focus, professional photography"
      },
      "digital art": {
        model: "flux",
        enhance: "digital art, concept art, ArtStation trending, vibrant colors, detailed illustration"
      },
      "anime": {
        model: "flux",
        enhance: "anime style, manga illustration, Studio Ghibli, cel shaded, clean linework, vivid colors"
      },
      "oil painting": {
        model: "flux",
        enhance: "oil painting, canvas texture, impressionist brushwork, rich colors, classical art style"
      },
      "cinematic": {
        model: "flux",
        enhance: "cinematic shot, movie still, dramatic lighting, anamorphic lens, 4K film grain, epic composition"
      },
      "pixel art": {
        model: "turbo",
        enhance: "pixel art, 16-bit retro game sprite, pixelated, crisp pixels, low-res aesthetic"
      },
    };

    // Parse style from prompt prefix (e.g. "Anime style: cat" → style=anime, subject=cat)
    let rawPrompt = prompt.trim();
    let detectedModel = "flux";
    let subject = rawPrompt;

    const styleMatch = rawPrompt.match(/^(.+?)\s+style:\s*(.+)$/i);
    if (styleMatch) {
      const styleKey = styleMatch[1].trim().toLowerCase();
      subject = styleMatch[2].trim();
      const styleConf = STYLE_MAP[styleKey];
      if (styleConf) {
        detectedModel = styleConf.model;
        subject = `${subject}, ${styleConf.enhance}`;
      }
    }

    let cleanPrompt = subject
      .replace(/\blebra\b/gi, "Labrador")
      .replace(/\blabra\b/gi, "Labrador");

    // Optimize dimensions for fast AI generation without queue delays
    let width = 512;
    let height = 512;
    if (size === "1024x1024") {
      width = 768;
      height = 768;
    } else if (size === "256x256") {
      width = 256;
      height = 256;
    }

    const seed = Math.floor(Math.random() * 1000000000);
    let imageResult = null;
    let providerName = "";

    // -------------------------------------------------------------
    // Tier 1: Pollinations AI — style-aware model + enhanced prompt
    // -------------------------------------------------------------
    try {
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&nofeed=true&model=${detectedModel}`;
      console.log(`[Tier 1] model=${detectedModel} prompt="${cleanPrompt}"`);
      fs.appendFileSync('debug_image.txt', `[Tier 1] Fetching: ${pollUrl}\n`);

      imageResult = await fetchImageBuffer(pollUrl, 20000);
      if (imageResult) providerName = `Pollinations AI (${detectedModel})`;
    } catch (err) {
      console.warn("Pollinations Tier 1 error:", err.message);
      fs.appendFileSync('debug_image.txt', `[Tier 1] Error: ${err.message}\n`);
    }

    // -------------------------------------------------------------
    // Tier 1B: Pollinations — smaller size retry (same seed)
    // -------------------------------------------------------------
    if (!imageResult && width > 512) {
      try {
        const pollFastUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=512&seed=${seed}&nologo=true&nofeed=true&model=flux`;
        console.log(`[Tier 1B] Retrying Pollinations 512x512 for: "${cleanPrompt}"`);
        fs.appendFileSync('debug_image.txt', `[Tier 1B] Retrying: ${pollFastUrl}\n`);

        imageResult = await fetchImageBuffer(pollFastUrl, 18000);
        if (imageResult) providerName = "Pollinations AI (Fast)";
      } catch (err) {
        console.warn("Pollinations Tier 1B error:", err.message);
      }
    }

    // -------------------------------------------------------------
    // Tier 1C: Pollinations — new fresh seed + default (turbo) model
    //          (handles rate-limit from back-to-back requests)
    // -------------------------------------------------------------
    if (!imageResult) {
      try {
        await new Promise(r => setTimeout(r, 1200)); // brief pause for rate-limit recovery
        const freshSeed = Math.floor(Math.random() * 1000000000);
        const pollRetryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=512&seed=${freshSeed}&nologo=true&nofeed=true`;
        console.log(`[Tier 1C] Fresh-seed retry Pollinations for: "${cleanPrompt}"`);
        fs.appendFileSync('debug_image.txt', `[Tier 1C] Fresh retry: ${pollRetryUrl}\n`);

        imageResult = await fetchImageBuffer(pollRetryUrl, 20000);
        if (imageResult) providerName = "Pollinations AI (Retry)";
      } catch (err) {
        console.warn("Pollinations Tier 1C error:", err.message);
      }
    }

    // -------------------------------------------------------------
    // Tier 2: Openverse API (Strictly prompt-based search of 700M+ CC images)
    // -------------------------------------------------------------
    if (!imageResult) {
      try {
        console.log(`[Tier 2] Searching Openverse for prompt: "${cleanPrompt}"`);
        fs.appendFileSync('debug_image.txt', `[Tier 2] Searching Openverse for: ${cleanPrompt}\n`);

        const openverseUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanPrompt)}&page_size=5`;
        const ovRes = await axios.get(openverseUrl, {
          headers: {
            "User-Agent": "AiSaasApp/1.0 (https://localhost:5173; contact@aisaaskit.com)"
          },
          timeout: 6000
        });

        const results = ovRes.data?.results;
        if (Array.isArray(results) && results.length > 0) {
          const chosen = results[Math.floor(Math.random() * Math.min(results.length, 4))];
          const imgUrl = chosen.thumbnail || chosen.url;
          if (imgUrl) {
            console.log(`[Tier 2] Found prompt-matching image: ${imgUrl}`);
            fs.appendFileSync('debug_image.txt', `[Tier 2] Found: ${imgUrl}\n`);
            imageResult = await fetchImageBuffer(imgUrl, 6000);
            if (imageResult) {
              providerName = "Openverse Media";
            }
          }
        }
      } catch (ovErr) {
        console.warn("Openverse Tier 2 error:", ovErr.message);
        fs.appendFileSync('debug_image.txt', `[Tier 2] Error: ${ovErr.message}\n`);
      }
    }

    // -------------------------------------------------------------
    // Tier 3: Wikimedia Commons Search (Strictly prompt-based)
    // -------------------------------------------------------------
    if (!imageResult) {
      try {
        console.log(`[Tier 3] Searching Wikimedia for prompt: "${cleanPrompt}"`);
        fs.appendFileSync('debug_image.txt', `[Tier 3] Searching Wikimedia for: ${cleanPrompt}\n`);

        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(cleanPrompt)}&gsrlimit=5&pithumbsize=1024&origin=*`;
        const wikiRes = await axios.get(wikiUrl, {
          headers: {
            "User-Agent": "AiSaasApp/1.0 (https://localhost:5173; contact@aisaaskit.com)"
          },
          timeout: 6000
        });

        const pages = wikiRes.data?.query?.pages;
        if (pages) {
          const pageList = Object.values(pages).filter(p => p.thumbnail?.source);
          if (pageList.length > 0) {
            const chosen = pageList[Math.floor(Math.random() * pageList.length)];
            const imgBuffer = await fetchImageBuffer(chosen.thumbnail.source, 6000);
            if (imgBuffer) {
              imageResult = imgBuffer;
              providerName = "Wikimedia Visual";
            }
          }
        }
      } catch (wikiErr) {
        console.warn("Wikimedia Tier 3 error:", wikiErr.message);
        fs.appendFileSync('debug_image.txt', `[Tier 3] Error: ${wikiErr.message}\n`);
      }
    }

    if (!imageResult) {
      throw new Error(`Unable to generate an image for "${cleanPrompt}". Please check the prompt or try again in a moment.`);
    }

    fs.appendFileSync('debug_image.txt', `Success (${providerName}). Length: ${imageResult.base64.length}\n`);

    // Increment usage and save once (combined with credit deduction above)
    if (user) {
      user.todayUsage = (user.todayUsage || 0) + 1;
      user.totalUsage = (user.totalUsage || 0) + 1;

      if (user.totalUsage >= 500 && user.userLevel !== "Platinum") {
        user.userLevel = "Platinum";
      } else if (user.totalUsage >= 200 && user.userLevel !== "Gold" && user.userLevel !== "Platinum") {
        user.userLevel = "Gold";
      } else if (user.totalUsage >= 50 && user.userLevel === "Bronze") {
        user.userLevel = "Silver";
      }

      await user.save();
    }

    // Save to History
    await History.create({
      user: userId,
      type: "image",
      title: `AI Image (${cleanPrompt})`,
      content: cleanPrompt,
    });

    res.json({
      success: true,
      provider: providerName,
      image: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
      remainingCredits: creditResult.remainingCredits,
      maxCredits: creditResult.maxCredits,
      totalCredits: creditResult.totalCredits ?? (user ? user.credits : undefined),
      freeCreditsResetAt: creditResult.freeCreditsResetAt,
      tool: "image",
    });

  } catch (err) {
    console.error("Image Gen Error:", err.message);
    const errorLog = `[${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\n`;
    fs.appendFileSync('debug_image.txt', errorLog);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate image. Please try again.",
      error: err.message,
    });
  }
};
