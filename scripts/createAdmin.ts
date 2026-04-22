require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Inline schema — avoids double connection issue
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  image:    { type: String },
  role:     { type: String, default: "user" },
});

async function createAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌  MONGODB_URI not found in .env.local");
      process.exit(1);
    }

    // Single connection only
    await mongoose.connect(uri);
    console.log("✅  Connected to MongoDB Atlas");

    // Get model AFTER connecting
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    const existing = await User.findOne({ email: "admin@example.com" });

    if (existing) {
      await User.updateOne(
        { email: "admin@example.com" },
        { $set: { role: "admin" } }
      );
      console.log("✅  Existing user promoted to admin.");
    } else {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅  Admin created successfully.");
    }

  } catch (err) {
    console.error("❌  Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createAdmin();