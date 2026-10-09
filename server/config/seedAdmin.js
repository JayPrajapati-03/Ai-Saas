import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@aisaas.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        plan: "Ultimate",
        credits: 999999,
      });
      console.log(`✅ Default Admin initialized: ${adminEmail}`);
    } else {
      let needsSave = false;
      if (admin.role !== "admin") {
        admin.role = "admin";
        needsSave = true;
      }
      const isMatch = await bcrypt.compare(adminPassword, admin.password);
      if (!isMatch) {
        admin.password = await bcrypt.hash(adminPassword, 10);
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`✅ Admin synchronized with fixed credentials: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("Admin seed error:", error.message);
  }
};
