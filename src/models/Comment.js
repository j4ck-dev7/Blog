import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  creationDate: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false, select: false }
});

commentSchema.index({ article: 1, creationDate: -1 });
commentSchema.index({ article: 1 });

export default mongoose.model('Comment', commentSchema);