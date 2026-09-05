import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["text", "summary", "image", "translate"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String, // Store the prompt or input text (can be truncated)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("History", HistorySchema);
