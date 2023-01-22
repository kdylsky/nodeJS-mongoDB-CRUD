const mongoose = require("mongoose");
const Product = require("./product")

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

//미들웨어를 설정하는 것이다.
//mongoose의 미들웨어는 express의 미들웨어랑은 다르기 때문에 next()를 호출하지 않아도 된다?
// farmSchema.pre("findOneAndDelete", async function(data){
//     console.log("pre middlewate")
//     console.log(data)
// })

farmSchema.post("findOneAndDelete", async function(farm){
    if(farm.products.length){
        const res = await Product.deleteMany({_id :{$in:farm.products}})
        console.log(res)
    }
})

const Farm = mongoose.model('Farm', farmSchema);
 
module.exports = Farm;