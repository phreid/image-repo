const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    title: String,
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    price: Number,
    description: String,
    quantity: Number,
    src: String
});

module.exports = mongoose.model('Image', ImageSchema);