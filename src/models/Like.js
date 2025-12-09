import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    creationDate: { type: Date, default: Date.now }
});

likeSchema.index({ article: 1 });
likeSchema.index({ article: 1, user: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);