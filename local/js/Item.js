/* This create item schema */
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        title: {type: String, required:true},
        desc:{type: String, required:true},
        size: {type: String},
        color: {type: String},
        price: {type: Number, required:true},
        url: {type: String, required:true},
        image: {type: String, required:true},
    },
    {timestamps: true}
); 

module.exports = mongoose.model("Item", itemSchema);