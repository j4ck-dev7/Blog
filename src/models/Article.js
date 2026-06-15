import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, index: true },
  creationDate: { type: Date, default: Date.now },
  author: { type: String, required: true },
  content: [],
  banner: { type: String, required: true },
  planRole: {
    index: true,
    type: String,
    enum: ["free", "basic", "intermediate", "premium"],
    default: "free",
  },
  viewsCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
});

articleSchema.index(
  {
    // index para busca textual (Gerenciar indices na administração do banco de dados)
    title: "text",
  },
  {
    weights: {
      // Peso para cada campo na busca textual (Maior peso = mais relevante)
      title: 100,
    },
    name: "TextIndex",
  },
);

export default mongoose.model("Article", articleSchema);
