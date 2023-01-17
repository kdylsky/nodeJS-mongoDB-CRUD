// 데이터베이스 데이터를 위한 시드데이터
const Product = require("./models/product");
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/shopApp')
    .then(()=>{
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch((err)=>{ 
        console.log("MONGO ERROR")
        console.log(err)
    })


// const p = new Product({
//     name: "pork", 
//     price: 1000, 
//     category:"meat", 
//     onSale:false,
//     qty:10
// })
// p.save()
//     .then(p =>{
//         console.log(p)
//     })
//     .catch(err=>{
//         console.log(err)
//     })

const seedProduct =[
    {name: "beef", price: 2000, category:"meat", onSale:false, qty:2},
    {name: "milk", price: 500, category:"drink", onSale:true, qty:5},
    {name: "apple", price: 1200, category:"fruit", onSale:false, qty:7},
    {name: "chocolate", price: 700, category:"snack", onSale:true, qty:3},
]

Product.insertMany(seedProduct)
    .then(res=>{
        console.log(res)
    })
    .catch(err=>{
        console.log(err)
    })