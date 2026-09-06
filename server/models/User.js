import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    credits: {
      type: Number,
      default: 120,
    },

    todayUsage: {
      type: Number,
      default: 0,
    },

    userLevel: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },

    totalUsage: {
      type: Number,
      default: 0,
    },

    lastActiveDate: {
      type: Date,
      default: Date.now,
    },

    plan: {
      type: String,
      enum: ["Basic", "Pro", "Ultimate"],
      default: "Basic",
    },

    planStartDate: {
      type: Date,
      default: Date.now,
    },

    billingHistory: [
      {
        transactionId: { type: String, required: true },
        plan: { type: String, required: true },
        amount: { type: String, required: true },
        date: { type: Date, default: Date.now },
        status: { type: String, default: "Completed" },
        paymentMethod: { type: String, default: "Credit Card (•••• 4242)" },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
