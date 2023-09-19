const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const mongoose = require("mongoose")
const port = 8000;
const path = require("path")

const data = path.join(__dirname+"")
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static('style'))
console.log("helloworld")
mongoose.connect("mongodb://127.0.0.1:27017/company").then(()=>{
console.log("yes  we got connected to localhost");
}).catch(()=>{
    console.log("here thier is some error")
})
const schema = mongoose.Schema({
    email:{
        type:String,
    },
    psw:String,
    repeatpsw:String,
    message:String,
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }]

})
schema.methods.generateauthtoken = async function(){
    try {
        console.log(this._id)
        const token = jwt.sign({_id:this._id.toString()},'mynameisabdul')
this.tokens = this.tokens.concat({token:token})
await this.save()
return token ;

        
    } catch (error) {
        console.log("wtf");
    }
}


schema.pre("save",async function(next){
console.log(this.psw);
this.psw =await bcrypt.hash(this.psw, 10)
console.log(this.psw)
this.repeatpsw = undefined
next()

})


const model = mongoose.model("data",schema)

app.get("/signup",(req,res)=>{
    try {
       res.sendFile(data+"/signup.html")
    } catch (error) {
        console.log(error);
    } 
})

app.get("/login.html",(req,res)=>{
    try {
     res.sendFile(data+"/login.html")
    } catch (error) {
        console.log(error);
    } 
})
app.get("/index.html",async(req,res)=>{
    try {
        res.sendFile(data+"/index.html")
    } catch (error) {
        console.log(error);
    } 
})

app.get("/signup.html",(req,res)=>{
    try {
        res.sendFile(data+"/signup.html")
    } catch (error) {
        console.log(error);
    } 
})
app.get("/style.html",(req,res)=>{
    try {
        res.sendFile(data+"/style.html")
    } catch (error) {
        console.log(error);
    } 
})

// sign in portion
app.post("/signup",async(req,res)=>{
try {
    const abc =await model(req.body)
    if (abc.psw === abc.repeatpsw){
   
    console.log(abc);
    const token = await abc.generateauthtoken()
    console.log("the token part is "+  token);
    

   const abcd = await abc.save()
   console.log(abcd);
   res.sendFile(data+"/index.html")
    }
    else{
        res.send("invalid signup detail")
    }
} catch (error) {
    console.log("look man something is missing");
}    
})

//login portion
app.post("/login",async(req,res)=>{
 try {
  
    const email = req.body.email
    const password =req.body.psw ;
const useremail =await model.findOne({email:email})
const match =await bcrypt.compare(password,useremail.psw)
console.log(match);


if(match){
    res.send('you have loged in sucessfully')
    const token = await useremail.generateauthtoken()
console.log("this token is" + token );
}
else{
    res.send("nah you can't")
}

    





   
 } catch (error) {
    console.log(error);
 }
})

app.listen(port,()=>{
    console.log("localhost:8000/signup")
})