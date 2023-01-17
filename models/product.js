const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0,
    },
    category:{
        type:String,
        lowercase:true,
        enum:["fruit", "snack", "drink", "meat"],
    },
    onSale:{
        type:Boolean,
        default:false
    },
    qty:{
        type:Number,
        default:1,
        min:0
    }
})
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
