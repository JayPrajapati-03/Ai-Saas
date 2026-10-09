import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowRight, Sparkles, Zap, Shield, Brain, Globe, FileText,
  Star, CheckCircle2, Users, TrendingUp, ChevronRight, Cpu,
  Play, MousePointerClick, Layers, Command, ArrowUpRight,
  ChevronDown, Menu, X, Twitter, Github, Linkedin, Youtube,
  Mail, Send, ExternalLink, Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE PARTICLE CANVAS
   ═══════════════════════════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const count = Math.min(80, Math.floor(window.innerWidth / 18));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.5 + 0.15,
    }));

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   TYPING ANIMATION
   ═══════════════════════════════════════════════════════════════ */
function TypingText({ words, className }) {
  const [currentWord, setCurrentWord] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(word.substring(0, text.length + 1));
        if (text.length === word.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, currentWord, words]);

  return (
    <span className={className}>
      {text}
      <span className="landing-cursor">|</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D TILT CARD
   ═══════════════════════════════════════════════════════════════ */
function TiltCard({ children, className, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED GRADIENT BORDER
   ═══════════════════════════════════════════════════════════════ */
function GradientBorderCard({ children, style, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="landing-gradient-border-card"
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HORIZONTAL MARQUEE
   ═══════════════════════════════════════════════════════════════ */
function Marquee({ children, speed = 30, direction = "left" }) {
  return (
    <div className="landing-marquee-container">
      <motion.div
        className="landing-marquee-track"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD (PREMIUM)
   ═══════════════════════════════════════════════════════════════ */
function FeatureCard({ icon, title, desc, gradient, delay }) {
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        className="landing-feature-card"
      >
        <div className="landing-feature-card-glow" style={{ background: gradient }} />
        <div className="landing-feature-icon" style={{ background: gradient }}>
          {icon}
        </div>
        <h3 className="landing-feature-title">{title}</h3>
        <p className="landing-feature-desc">{desc}</p>
        <div className="landing-feature-arrow">
          <ArrowUpRight size={16} />
        </div>
      </motion.div>
    </TiltCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRICING CARD
   ═══════════════════════════════════════════════════════════════ */
function PricingCard({ plan, price, desc, features, popular, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`landing-pricing-card ${popular ? "landing-pricing-popular" : ""}`}
    >
      {popular && (
        <div className="landing-pricing-badge">
          <Sparkles size={12} />
          MOST POPULAR
        </div>
      )}
      <div className="landing-pricing-plan">{plan}</div>
      <div className="landing-pricing-price">
        {price}
        {price !== "Free" && <span className="landing-pricing-period">/mo</span>}
      </div>
      <p className="landing-pricing-desc">{desc}</p>
      <div className="glow-divider" style={{ margin: "24px 0" }} />
      <ul className="landing-pricing-features">
        {features.map((f, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.05 * i }}
          >
            <CheckCircle2 size={16} className="landing-pricing-check" />
            {f}
          </motion.li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`landing-pricing-cta ${popular ? "landing-pricing-cta-popular" : ""}`}
      >
        Get started <ChevronRight size={16} />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL INDICATOR
   ═══════════════════════════════════════════════════════════════ */
function ScrollIndicator() {
  return (
    <motion.div
      className="landing-scroll-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={20} />
      </motion.div>
      <span>Scroll to explore</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = ["Features", "Pricing", "About"];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`landing-navbar ${scrolled ? "landing-navbar-scrolled" : ""}`}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Cpu size={18} color="white" />
          </div>
          <span className="landing-logo-text">
            AI<span className="gradient-text">SaaS</span>
          </span>
          <span className="landing-version-badge">v2.0</span>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="landing-nav-links">
        {navLinks.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="landing-nav-link">
            {item}
            <span className="landing-nav-link-line" />
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="landing-nav-cta">
        <Link to="/login" className="landing-nav-signin">
          Sign in
        </Link>
        <Link to="/register" className="landing-nav-start">
          <span>Get Started</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        className="landing-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="landing-mobile-menu"
          >
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="landing-mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="landing-mobile-actions">
              <Link to="/login" className="landing-nav-signin" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="landing-nav-start" onClick={() => setMobileOpen(false)}>
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const heroWords = useMemo(
    () => ["Content", "Images", "Summaries", "Translations", "Ideas"],
    []
  );

  const features = [
    { icon: <Sparkles size={24} />, title: "AI Text Generator", desc: "Generate articles, blogs, social posts, and creative copy in seconds with context-aware AI.", gradient: "linear-gradient(135deg, #7c3aed, #a855f7)" },
    { icon: <FileText size={24} />, title: "Smart Summarizer", desc: "Condense lengthy documents and reports into crisp, meaningful summaries instantly.", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
    { icon: <Zap size={24} />, title: "Image Generation", desc: "Create breathtaking HD images from simple text prompts — any style, any concept.", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
    { icon: <Globe size={24} />, title: "AI Translator", desc: "Translate between 7+ languages with natural, fluent results powered by AI.", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
    { icon: <Brain size={24} />, title: "AI Chat Assistant", desc: "Chat with a powerful AI for brainstorming, Q&A, coding help, and more.", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
    { icon: <Shield size={24} />, title: "Enterprise Security", desc: "JWT auth, encrypted storage, role-based access, and SOC 2 compliance built in.", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Product Designer", text: "AISaaS completely transformed my workflow. I generate assets 10x faster.", avatar: "SC" },
    { name: "Marcus Johnson", role: "Content Creator", text: "The text generator is insane. It understands context better than anything I've used.", avatar: "MJ" },
    { name: "Priya Patel", role: "Startup Founder", text: "We replaced 3 different tools with AISaaS. The pricing is unbeatable.", avatar: "PP" },
    { name: "Alex Rivera", role: "Developer", text: "Image generation quality rivals DALL-E. And the API is beautifully simple.", avatar: "AR" },
    { name: "Emma Wilson", role: "Marketing Lead", text: "Our content production increased 5x. AISaaS is now essential for our team.", avatar: "EW" },
    { name: "James Kim", role: "Freelancer", text: "The summarizer alone saved me hours every week. Can't imagine working without it.", avatar: "JK" },
  ];

  /* letter-by-letter stagger animation */
  const headingVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  const headingText = "Create Anything With";

  return (
    <div className="landing-root">
      {/* Backgrounds */}
      <ParticleField />
      <div className="landing-grid-bg" />
      <div className="landing-radial-glow landing-radial-glow-1" />
      <div className="landing-radial-glow landing-radial-glow-2" />
      <div className="landing-radial-glow landing-radial-glow-3" />

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-badge"
        >
          <div className="landing-hero-badge-dot" />
          <span>Now in Public Beta — Try Free Today</span>
          <ArrowRight size={13} />
        </motion.div>

        <motion.h1
          className="landing-hero-heading"
          variants={headingVariants}
          initial="hidden"
          animate="visible"
        >
          {headingText.split("").map((char, i) => (
            <motion.span key={i} variants={letterVariants} style={{ display: "inline-block" }}>
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
          <br />
          <TypingText
            words={heroWords}
            className="landing-hero-typing"
          />
        </motion.h1>

        <motion.p
          className="landing-hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          The all-in-one AI platform for generating content, images, summaries,
          and translations. Built for creators who demand excellence.
        </motion.p>

        <motion.div
          className="landing-hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Link to="/register" className="landing-hero-cta-primary">
            <span>Start Creating Free</span>
            <ArrowRight size={18} />
            <div className="landing-hero-cta-shine" />
          </Link>
          <a href="#features" className="landing-hero-cta-secondary">
            <Play size={16} />
            <span>See How It Works</span>
          </a>
        </motion.div>

        {/* Trust metrics */}
        <motion.div
          className="landing-trust-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {[
            { icon: <Users size={14} />, text: "10,000+ Creators" },
            { icon: <Star size={14} />, text: "4.9/5 Rating" },
            { icon: <Shield size={14} />, text: "SOC 2 Certified" },
            { icon: <Zap size={14} />, text: "99.9% Uptime" },
          ].map(({ icon, text }) => (
            <div key={text} className="landing-trust-item">
              <span className="landing-trust-icon">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        <ScrollIndicator />
      </section>

      {/* ── LOGOS / MARQUEE ── */}
      <section className="landing-marquee-section">
        <Marquee speed={40}>
          <div className="landing-marquee-items">
            {testimonials.map((t, i) => (
              <div key={i} className="landing-testimonial-chip">
                <div className="landing-testimonial-avatar">{t.avatar}</div>
                <div>
                  <p className="landing-testimonial-text">"{t.text}"</p>
                  <p className="landing-testimonial-meta">{t.name} · {t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Marquee>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="landing-section-header"
        >
          <span className="landing-section-badge">
            <Command size={12} />
            FEATURES
          </span>
          <h2 className="landing-section-title">
            Six powerful tools.{" "}
            <span className="gradient-text">One platform.</span>
          </h2>
          <p className="landing-section-desc">
            Everything you need to generate, translate, summarize, and create — powered by state-of-the-art AI models.
          </p>
        </motion.div>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          {[
            { n: 10000, suffix: "+", label: "Active Users", icon: <Users size={22} />, gradient: "linear-gradient(135deg, #7c3aed, #a855f7)" },
            { n: 500000, suffix: "+", label: "AI Requests", icon: <Zap size={22} />, gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
            { n: 50000, suffix: "+", label: "Images Created", icon: <Sparkles size={22} />, gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
            { n: 99, suffix: ".9%", label: "Uptime SLA", icon: <Shield size={22} />, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
          ].map(({ n, suffix, label, icon, gradient }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="landing-stat-card"
            >
              <div className="landing-stat-icon" style={{ background: gradient }}>
                {icon}
              </div>
              <div className="landing-stat-number">
                <Counter to={n} suffix={suffix} />
              </div>
              <div className="landing-stat-label">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="landing-section-header"
        >
          <span className="landing-section-badge">
            <Layers size={12} />
            PRICING
          </span>
          <h2 className="landing-section-title">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="landing-section-desc">
            No hidden fees. Start free and scale when you're ready.
          </p>
        </motion.div>

        <div className="landing-pricing-grid">
          <PricingCard
            plan="Starter"
            price="Free"
            desc="Perfect for getting started"
            features={["AI Text Generation", "AI Summarizer", "Basic Translator", "10 images / day", "Community support"]}
            delay={0}
          />
          <PricingCard
            plan="Pro"
            price="$9.99"
            desc="For serious creators"
            features={["Everything in Starter", "Fast AI responses", "HD Image Generation", "500 images / month", "Priority support", "API access"]}
            popular
            delay={0.1}
          />
          <PricingCard
            plan="Ultimate"
            price="$19.99"
            desc="For power users & teams"
            features={["Everything in Pro", "Ultra-fast AI models", "Unlimited images", "Full API access", "Custom integrations", "Dedicated support"]}
            delay={0.2}
          />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="landing-section-header"
        >
          <span className="landing-section-badge">
            <Star size={12} />
            ABOUT US
          </span>
          <h2 className="landing-section-title">
            Built for <span className="gradient-text">creators</span>, by creators
          </h2>
          <p className="landing-section-desc">
            AISaaS was born from a single idea — make powerful AI tools accessible to everyone, not just enterprises.
          </p>
        </motion.div>

        <div className="landing-about-grid">
          {[
            { icon: <TrendingUp size={28} />, title: "Our Mission", desc: "Democratize AI so every creator can build without limits — regardless of technical background or budget.", gradient: "linear-gradient(135deg, #7c3aed, #a855f7)" },
            { icon: <Globe size={28} />, title: "Our Vision", desc: "A world where anyone can generate, translate, summarize, and create stunning content in seconds.", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
            { icon: <Shield size={28} />, title: "Our Values", desc: "Privacy-first. Transparent pricing. Enterprise-grade security at every layer of our platform.", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
            { icon: <Users size={28} />, title: "Our Team", desc: "A passionate team of engineers, designers, and AI researchers building the future of creative tools.", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
          ].map(({ icon, title, desc, gradient }, i) => (
            <GradientBorderCard key={title} delay={i * 0.1}>
              <div className="landing-about-card-icon" style={{ background: gradient }}>
                {icon}
              </div>
              <h3 className="landing-about-card-title">{title}</h3>
              <p className="landing-about-card-desc">{desc}</p>
            </GradientBorderCard>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BOTTOM ZONE — dark panel: CTA banner + full footer
          ════════════════════════════════════════════════════════ */}
      <div className="landing-bottom-zone">

        {/* ── CTA BANNER ── */}
        <div className="landing-cta-wrap">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="landing-cta-banner"
          >
            <div className="landing-cta-banner-bg" />
            <div className="landing-cta-banner-content">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="landing-cta-banner-icon"
              >
                <Sparkles size={32} />
              </motion.div>
              <h2 className="landing-cta-title">
                Ready to supercharge<br />your creative workflow?
              </h2>
              <p className="landing-cta-desc">
                Join 10,000+ creators who use AISaaS to produce better work, faster.
              </p>
              <div className="landing-cta-actions">
                <Link to="/register" className="landing-hero-cta-primary">
                  <span>Start Building for Free</span>
                  <ArrowRight size={18} />
                  <div className="landing-hero-cta-shine" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="landing-footer">

          {/* Glow separator line */}
          <div className="landing-footer-glow-bar" />

          {/* Main footer container */}
          <div className="landing-footer-container">
            <div className="landing-footer-grid">

              {/* Col 1: Brand Info & Status */}
              <div className="landing-footer-brand-col">
                <Link to="/" style={{ textDecoration: "none" }}>
                  <div className="landing-logo" style={{ marginBottom: 16 }}>
                    <div className="landing-logo-icon">
                      <Cpu size={16} color="white" />
                    </div>
                    <span className="landing-logo-text" style={{ fontSize: 18 }}>
                      AI<span className="gradient-text">SaaS</span>
                    </span>
                    <span className="landing-footer-version-tag">v2.4</span>
                  </div>
                </Link>
                <p className="landing-footer-tagline">
                  The all-in-one AI creative engine. Generate high-converting copy, code, imagery, and audio workflows at scale.
                </p>

                {/* Status indicator */}
                <div className="landing-footer-status-pill">
                  <div className="landing-footer-status-dot" />
                  <span>All Systems Operational</span>
                </div>

                {/* Social icons */}
                <div className="landing-footer-socials">
                  {[
                    { icon: <Twitter size={15} />, label: "Twitter", href: "#" },
                    { icon: <Github size={15} />, label: "GitHub", href: "#" },
                    { icon: <Linkedin size={15} />, label: "LinkedIn", href: "#" },
                    { icon: <Youtube size={15} />, label: "YouTube", href: "#" },
                  ].map(({ icon, label, href }) => (
                    <motion.a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="landing-footer-social-btn"
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Col 2: Products */}
              <div className="landing-footer-col">
                <h4>Products</h4>
                <a href="#features"><Sparkles size={12} />AI Content Writer</a>
                <a href="#features"><Zap size={12} />Code Copilot</a>
                <a href="#features"><Brain size={12} />Image Generator</a>
                <a href="#features"><Cpu size={12} />Voice Transcriber</a>
                <a href="#features"><FileText size={12} />Document Summary</a>
                <Link to="/register"><ArrowUpRight size={12} />Prompt Studio</Link>
              </div>

              {/* Col 3: Solutions */}
              <div className="landing-footer-col">
                <h4>Solutions</h4>
                <a href="#about"><Users size={12} />For Developers</a>
                <a href="#about"><Sparkles size={12} />Content Creators</a>
                <a href="#about"><TrendingUp size={12} />Marketing Teams</a>
                <a href="#about"><Globe size={12} />Enterprise Teams</a>
                <a href="#pricing"><Zap size={12} />Transparent Pricing</a>
                <Link to="/register"><ArrowUpRight size={12} />API Platform</Link>
              </div>

              {/* Col 4: Resources */}
              <div className="landing-footer-col">
                <h4>Resources</h4>
                <a href="#features"><FileText size={12} />Documentation</a>
                <a href="#features"><Cpu size={12} />API Reference</a>
                <a href="#about"><Users size={12} />Discord Community</a>
                <a href="#about"><Sparkles size={12} />Guides & Tutorials</a>
                <a href="#about"><TrendingUp size={12} />Changelog</a>
                <a href="#about"><Shield size={12} />Security Center</a>
              </div>

              {/* Col 5: Company */}
              <div className="landing-footer-col">
                <h4>Company</h4>
                <a href="#about"><Users size={12} />About Our Mission</a>
                <a href="#about">
                  <TrendingUp size={12} />Careers
                  <span className="landing-footer-hiring-pill">Hiring</span>
                </a>
                <a href="#about"><FileText size={12} />Blog & Stories</a>
                <a href="#about"><Globe size={12} />Press & Media</a>
                <Link to="/privacy"><Shield size={12} />Privacy Policy</Link>
                <Link to="/terms"><FileText size={12} />Terms of Service</Link>
              </div>

              {/* Col 6: Stay Updated / Newsletter */}
              <div className="landing-footer-newsletter-col">
                <h4>Stay In The Loop</h4>
                <p className="landing-footer-newsletter-desc">
                  Join 25,000+ builders receiving weekly AI workflows, prompt tricks, and new feature drops.
                </p>

                <form className="landing-footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="landing-footer-newsletter-input-wrap">
                    <Mail size={15} className="landing-footer-newsletter-icon" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="landing-footer-newsletter-input"
                    />
                    <button className="landing-footer-newsletter-btn" aria-label="Subscribe">
                      <Send size={13} />
                    </button>
                  </div>
                </form>

                <div className="landing-footer-newsletter-perks">
                  <span><CheckCircle2 size={12} color="#10b981" /> No spam guarantee</span>
                  <span><CheckCircle2 size={12} color="#10b981" /> Unsubscribe anytime</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom copyright bar */}
          <div className="landing-footer-bottom">
            <div className="landing-footer-bottom-container">
              <div className="landing-footer-bottom-left">
                <p>© 2025 AISaaS Inc. All rights reserved.</p>
              </div>

              <div className="landing-footer-bottom-links">
                <Link to="/privacy">Privacy</Link>
                <span className="landing-footer-dot">•</span>
                <Link to="/terms">Terms</Link>
                <span className="landing-footer-dot">•</span>
                <Link to="/terms#liability">Security</Link>
                <span className="landing-footer-dot">•</span>
                <Link to="/privacy#cookies">Cookies</Link>
                <span className="landing-footer-dot">•</span>
                <Link to="/terms#availability">Status</Link>
              </div>

              <p className="landing-footer-made-with">
                Crafted with <Heart size={12} className="landing-footer-heart" /> for creators worldwide
              </p>
            </div>
          </div>

        </footer>
      </div>
    </div>
  );
}

