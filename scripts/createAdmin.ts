import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
    await mongoose.connect(process.env.MONGODB_URI!);

    const hashedPassword = await bcrypt.hash("password123", 10);

    const existing = await User.findOne({ email: "admin@example.com" });

    if (existing) {
        console.log("Admin already exists");
        process.exit();
    }

    await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
    });

    console.log("✅ Admin created successfully");
    process.exit();
}

createAdmin();