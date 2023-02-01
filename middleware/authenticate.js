import  Jwt from "jsonwebtoken";
import  userdb from "../models/userSchema.js"
const keysecret = "amitraat"

 const authenticate = async(req,res,next)=>{
    try{
        const token =  req.headers.authorization
     
      
       
         const verifytoken = Jwt.verify(token , keysecret)
     

        const rootuser = await userdb.findById({_id : verifytoken._id})
        if(!rootuser) {throw new Error("user not found")}

        req.token = token
        req.rootuser = rootuser
        req.userId = rootuser._id

        next();
       
     

    }
    catch(error){
        
         res.status(401).json({status:401,message:"Unauthorized no token provide"})

    }
}

export default authenticate