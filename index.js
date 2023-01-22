const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const Farm = require("./models/farm");
const methodOverride = require("method-override");

const AppError = require("./AppError");

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

// 비동기 콜백을 감싸는 함수를 만들어서 try..catch를 반복해서 사용하지 않게 한다.
// 전체코드가 우리가 정의한 다른 함수로 전달되는 개념이다.
// wrapAsync()에 전달되는 개념이다.
// wrapAsync은 함수를 하나 반환할텐데 그 함수가 로직을 호출한다.
function wrapAsync(fn){
    // req,res,next가 필요한 이유는 fn에 전달하기 위해서이다.
    return function(req,res,next){
        fn(req,res,next).catch(e=> next(e))
    }
}


// FARM ROUTE
app.get("/farms", wrapAsync(async(req,res)=>{
    const farms = await Farm.find({});
    res.render("farms/index",{ farms });
}))

app.get("/farms/new", (req,res)=>{
    res.render("farms/new")
})

app.get("/farms/:id", wrapAsync(async(req,res)=>{
    const { id } = req.params;
    const farm = await Farm.findById(id)
    res.render("farms/detail", {farm})
}))


app.post("/farms", wrapAsync(async(req,res)=>{
    // 유효성검사가 필요하지만 여기서는 그냥 진행한다.
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect("/farms")
}))





// PRODUCT ROUTE
categories =["fruit","snack","drink","meat"]
onSales = [true, false]


// 라우터를 위한 비동기 콜백의 패턴이다.
// 비동기 라우터 핸들러에서 mongoose, DB의 연산자를 기다리는 일은 흔하다.
app.get("/products", wrapAsync(async(req,res, next)=>{
    const {category} = req.query;
    if (category){
        const products = await Product.find({category})
        return res.render("products/index", { products, category}) 
    }else{
        //find()가 시간이 걸리고 thenalbe객체를 반환하지만 아래와 같이 사용할 수 도 있다.
        const products = await Product.find({});       
        return res.render("products/index", { products, category:"All"}) 
    }
}))



// 새로운 상품을 등록하는 폼을 랜더링하는 라우터
app.get("/products/new", (req,res)=>{
    res.render("products/new", { categories, onSales })
})

app.post("/products", wrapAsync(async(req,res, next)=>{
    const newProduct = new Product(req.body);
    // save()는 promise객체를 반환하기 때문에 비동기 처리해준다
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
}));




// 비동기 라우터 핸들러를 생성해서 모델에 대한 연산을 기다린 후 데이터를 반환
// findById의 return 벨류도 query이고 thenable객체이기 때문에 async 비동기 함수로 처리해준다.

// 아래의 패턴은 비동기 함수에서 실행되는 패턴이긴 한데 api로 작업하고 요청을 하거나 또는 데이터베이스로 작업을 하기 때문에
// 시간이 걸려서 많은 라우트 핸들러와 미들웨어가 비동기에 해당한다.
// 많은 비동기항목과 비동기 함수 그리고 연관된 promise들의 경우 그 중 하나에서 오류를 발생시키려면 언제나
// 매개변수로 추가해주어야 한다.
// 엑세스 할 수 있는 next를 호출해야 하고 거기에 오류나 뭔가를 전달해야 한다.
// 다음 오류 핸들러를 발동시킨다.

app.get("/products/:id", wrapAsync(async(req, res, next)=>{
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    // else가 아니기 때문에 return해주어야 한다.
    if (!foundProduct){
        throw new AppError("Not Item", 404);
    }
    res.render("products/detail", { foundProduct });
}))


app.get("/products/:id/edit", wrapAsync(async(req,res, next)=>{
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    // else가 아니기 때문에 return해주어야 한다.
    if (!foundProduct){
        throw new AppError("Not Item", 404);
    }
    res.render("products/edit",{ foundProduct, categories, onSales }); 
}));

app.put("/products/:id",wrapAsync(async(req,res,next)=>{
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect(`/products/${product._id}`)
}))


app.delete("/products/:id", wrapAsync(async(req,res)=>{
    const { id } = req.params;
    // 쿼리 객체를 반환하는 thenable객체이다.
    const product = await Product.findByIdAndDelete(id);
    console.log(product)
    res.redirect(`/products`)
}))


// mongoose 오류 종류별 처리방법
const handleValidationErr = err=>{
    return new AppError(`Validation Failed... ${err.message}`, 400)
}
const handleCastErr = err=>{
    return new AppError(`Cast Failed... ${err.message}`, 400)
}
app.use((err, req,res,next)=>{
    if(err.name==="ValidationError"){
        err = handleValidationErr(err);
    }
    if(err.name==="CastError"){
        err = handleCastErr(err);
    }
    next(err);
})

// 오류핸들러를 작성해서 해당 오류 핸들러가 작동하게 한다.
// 기본 오류 처리 작업
app.use((err, req, res, next)=>{
    const { status = 500, message="Something is wrong"} = err;
    res.status(status).send(message)
})

app.listen(3000, ()=>{
    console.log("SERVING 3000 PORT");
})


//mongoose에서 오는 오류의 경우나 코드를 망쳐서 생기는 우연한 오류등은 실제로 next를 호출하지 않았는데 
//잘못된 경우는 어떻게 해야 할까?

// 비동기 함수에서는 보통 try..catch로 처리한다.
// 비동기 함수에서는 모든 걸 try.. catch로 감싸야 한다.


// express에서 네 개의 매개변수가 있는 함수를 쓸때 
// express가 첫번째 매개변수인 err를 오류처리 미들웨어로 취급해서
// 라우트에서 발생되거나 또는 이전 미들웨어에서 발생된 오류가 있는 경우에는
// 처음으로 일치하는 항목을 호출할 거다.

// 비동기 함수의 경우에는 이 문제와 오류를 잡아내도록 만들기 위해 추가적인 단계가 필요하다.
// 그리고는 next를 직접 호출한다. wrapAsync()가 next를 호출한다.