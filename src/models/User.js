import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true, unique:true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, index: true, unique:true, minlength: 13, maxlength: 50 },
    password: { type: String, required: true, minlength: 8, maxlength: 100 },
    role: {
        type: String, 
        enum: [ 'admin', 'user' ],
        default: 'user'
    },
    creationDate: { type: Date, default: Date.now },
    subscription: {
        plan: {
            type: String,
            enum: [ 'free', 'basic', 'intermediate', 'premium' ],
            default: 'free',
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
})

export default mongoose.model('User', userSchema);