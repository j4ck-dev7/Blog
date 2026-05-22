import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    type: {
        type: String, required: true, enum: ['paragraph', 'image'],
    },
    value: {
        type: String, required: () => {
            return contentSchema.type === 'paragraph';
        }
    },
    url: {
        type: String, required: () => {
            return contentSchema.type === 'image';
        }
    },
    legend: {
        type: String, required: () => {
            return contentSchema.type === 'image';
        }
    },
    alt: {
        type: String, required: () => {
            return contentSchema.type === 'image';
        }
    }
}, { _id: false });

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    creationDate: { type: Date, default: Date.now },
    author: { type: String, required: true },
    content: [contentSchema],
    banner: { type: String, required: true },
    tags: {
        index: true,
        type: [ String ],
        required: true
    },
    planRole: {
        index: true,
        type: String,
        enum: [ 'free', 'basic', 'intermediate', 'premium' ],
        default: 'free'
    },
    viewsCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
})

articleSchema.index({ // index para busca textual (Gerenciar indices na administração do banco de dados)
    title: 'text',
    tags: 'text',
    content: 'text'
}, {
    weights: { // Peso para cada campo na busca textual (Maior peso = mais relevante)
        title: 100,
        tags: 35,
        content: 10
    },
    name: 'TextIndex'
})
articleSchema.index({ title: 1, creationDate: -1 });
articleSchema.index({ tags: 1, creationDate: -1 });

export default mongoose.model('Article', articleSchema);