const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const methodOverride = require("method-override");

mongoose.connect('mongodb://127.0.0.1:27017/shopApp')
    .then(()=>{
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch((err)=>{ 
        console.log("MONGO ERROR")
        console.log(err)
    })

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//express가 미들웨어를 사용해서 body를 파싱할 수 있게 해야 한다.
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));

categories =["fruit","snack","drink","meat"]
onSales = [true, false]

// 라우터를 위한 비동기 콜백의 패턴이다.
// 비동기 라우터 핸들러에서 mongoose, DB의 연산자를 기다리는 일은 흔하다.
app.get("/products", async(req,res)=>{
    const {category} = req.query;
    if (category){
        const products = await Product.find({category})
        return res.render("products/index", { products, category}) 
    }else{
        //find()가 시간이 걸리고 thenalbe객체를 반환하지만 아래와 같이 사용할 수 도 있다.
        const products = await Product.find({});       
        return res.render("products/index", { products, category:"All"}) 
    }
})

// app.get("/products", (req,res)=>{
    // exec()는 완전한 promise객체를 반환한다.
//     Product.find({}).exec() 
//         .then(p => {
//             res.send(p)
//         })
//         .catch(err=>{
//             res.send(err)
//         })
// })

// 새로운 상품을 등록하는 폼을 랜더링하는 라우터
app.get("/products/new", (req,res)=>{
    res.render("products/new", { categories, onSales })
})

app.post("/products", async (req,res)=>{
    const newProduct = new Product(req.body);
    // save()는 promise객체를 반환하기 때문에 비동기 처리해준다
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`) 
})


// 비동기 라우터 핸들러를 생성해서 모델에 대한 연산을 기다린 후 데이터를 반환
// findById의 return 벨류도 query이고 thenable객체이기 때문에 async 비동기 함수로 처리해준다.
app.get("/products/:id", async(req, res)=>{
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render("products/detail", { foundProduct });
})

app.get("/products/:id/edit", async(req,res)=>{
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render("products/edit",{ foundProduct, categories, onSales });
})

app.put("/products/:id", async(req,res)=>{
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect(`/products/${product._id}`)
})

app.delete("/products/:id", async(req,res)=>{
    const { id } = req.params;
    // 쿼리 객체를 반환하는 thenable객체이다.
    const product = await Product.findByIdAndDelete(id);
    console.log(product)
    res.redirect(`/products`)
})

app.all("*", (req,res)=>{
    res.send("hahaha")
})

app.listen(3000, ()=>{
    console.log("SERVING 3000 PORT");
})