import mongoose from "mongoose";

const KnowledgeSchema = new mongoose.Schema({
  content: String,
  category: String,
  embedding: [Number]
});

export default mongoose.models.Knowledge ||
  mongoose.model("Knowledge", KnowledgeSchema);
