const jwt = require("jsonwebtoken");
const register = required(__dirname+"")
const auth = async(req,res,next)=>{
    try {
       const token = req.cookies.jwt;
       const verifyuser = jwt.verify(token,"mynameisabdul") 
console.log(verifyuser); 
next()
   } catch (error) {
       console.log(error);
   }
}