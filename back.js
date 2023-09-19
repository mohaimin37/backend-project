const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const mongoose = require("mongoose")
const port = 8000;
const path = require("path")
const cookies = require("cookie-parser")
const { verify } = require("crypto")


const data = path.join(__dirname+"")
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookies())
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

schema.pre("save", async function(next){
    console.log(this.psw);
   if(this.isModified("psw")){
    this.psw = await bcrypt.hash(this.psw,10)
    console.log(this.psw)
    this.repeatpsw = undefined
   }
   next()
    
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
    





const model = mongoose.model("hmm",schema)

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
const auth = async(req,res,next)=>{
    try {
       const token = req.cookies.jwt;
       const verifyuser = jwt.verify(token,"mynameisabdul") 
console.log(verifyuser); 
const user = await model.findOne({_id:verifyuser._id})
console.log(user.psw);
req.token = token;
req.user = user;
next()
   } catch (error) {
       console.log(error);
   }
}


app.get("/style.html",auth,(req,res)=>{
    try {
console.log("this is the cookie "+req.cookies.jwt)

        res.sendFile(data+"/style.html")
    } catch (error) {
        console.log(error);
    } 
})
app.get("/logout.html",auth,async(req,res)=>{
try {
    console.log(req.user);
    res.clearCookie("jwt")
    console.log("logout sucessfully");
    await req.user.save()
        res.sendFile(data+"/login.html")
    
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
  // res.cookie("anas",token)

   res.cookie("jwt",token,{
    expires:new Date(Date.now() + 5000000),

    httpOnly:true
   })

   
  await abc.save()
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
const token = await useremail.generateauthtoken()
console.log("this token is" + token );
console.log(match);
res.cookie("jwt",token,{
    expires:new Date(Date.now() + 5000000),

//secure:true
    
   })


if(match){
    res.send('you have loged in sucessfully')
    
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

