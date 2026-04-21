import mongoose from "mongoose";
import Knowledge from "../models/Knowledge.js";
import { createEmbedding } from "../lib/embeddings.js";

await mongoose.connect(process.env.MONGODB_URI);

const knowledgeData = [
  {
    category: "shipping",
    content: "Delivery takes 3 to 5 working days across Pakistan."
  },
  {
    category: "return",
    content: "Returns are accepted within 7 days if unused."
  },
  {
    category: "payment",
    content: "We support Cash on Delivery, Stripe and Easypaisa."
  }
];

for (const item of knowledgeData) {
  const embedding = await createEmbedding(item.content);

  await Knowledge.create({
    content: item.content,
    category: item.category,
    embedding
  });

  console.log("Trained:", item.content);
}

console.log("✅ Knowledge training completed");
process.exit();
