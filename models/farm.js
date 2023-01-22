const mongoose = require("mongoose");

// 하나의 농장에는 여러개의 상품을 팔수 있다.
// 이때 어떻게 데이터를 접근하고 사용할 것인지에 대해서 생각해서 ref를 어디에 둘지 결정한다.
const farmSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Farm mush have a name!"]
    },
    city:{
        type:String,
    },
    email:{
        type:String,
        required:[true, "Email required"]
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }]
})

const Farm = mongoose.model('Farm', farmSchema);
 
module.exports = Farm;