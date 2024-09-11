const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    commentaire: { type: String, required: true },
    commercialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercial', required: true },
    date: { type: Date, default: Date.now }
    
},
{ timestamps: true }
);

const modelName = 'Comment';

if (mongoose.models[modelName]) {
    module.exports = mongoose.model(modelName);
} else {
    module.exports = mongoose.model(modelName, CommentSchema);
}
