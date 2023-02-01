import express, { json } from "express";
const router = express.Router()
import userdb from "../models/userSchema.js"
import bcrypt from "bcrypt"
 import authenticate from "../middleware/authenticate.js"
import jwt from "jsonwebtoken"
const keysecret = "amitraat"
import nodemailer from "nodemailer"
//import cookie from "cookie-parser"


const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
    user: "rawatamit8285@gmail.com",
    pass: "gqongrnietqilneh",
    },
  });






// for user registration

router.post("/register", async (req, res) => {
    const { fname, email, password, cpassword } = req.body
    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "fill all the detail" })
    }
    try {
        const preuser = await userdb.findOne({ email: email })
        if (preuser) {
            res.status(422).json({ error: "this email already exits" })
        }
        else {
            if (password === cpassword) {
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password, salt)
                const FinalUser = new userdb({
                    fname: fname,
                    email: email,
                    password: hashPassword,
                    cpassword: hashPassword
                })

                let storeData = await FinalUser.save()
                console.log(storeData)
                res.status(201).json({ status: 200, storeData })
            }
            else {
                res.status(422).json({ error: "password does not match" })
            }}}
   
    catch (error) {
        res.status(422).json(error)
        console.log("error")
    }
})




// for login


router.post("/login", async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({ error: "fill all the detail" })
    }
    try {
        const userValid = await userdb.findOne({ email: email })
        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password)
            if (!isMatch) {

                res.status(422).json({ error: "incorrect email or passowrd" })
            }
            else {

                // token generate
                const token = await userValid.generateAuthtoken()

                //cookie generation
                res.cookie("usercookie", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                })

                const result = {
                    userValid,
                    token
                }
                console.log(userValid)

                res.status(201).json({ status: 201, result })
            }
        }
        else {
            res.status(422).json({ error: "you are not register user" })
        }
    }
    catch (error) {
        console.log(error)
    }
})




////// user valid
router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        res.status(401).json({status:401,message : "unauthorize no token provide"});
    }
 });




 router.get("/logout",authenticate,async(req,res)=>{
    try {
        req.rootuser.tokens = req.rootuser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie",{path:"/"});

        req.rootuser.save();

        res.status(201).json({status:201})

    } catch (error) {
        res.status(401).json({status:401,error})
    }
})








// passwordresetlink
router.post("/sendpasswordLink", async (req,res)=>{

const{email}  =  req.body
if(!email){
    res.status(401).json({status : 401, "message" : "enter your email"})
}
try{
    const userFind = await userdb.findOne({email : email})
    const token =  jwt.sign({_id : userFind._id} , keysecret , {
        expiresIn : "1d"
    })
    const setUserToken = await userdb.findByIdAndUpdate({_id : userFind._id} , {verifytoken : token} , {new : true})

    if(setUserToken){

        const mailOptions = {
            from:"rawatamit8285@gmail.com",
            to:userFind.email,
            subject:"Sending Email For password Reset",
            text:`This Link Valid For 1 day http://localhost:3000/forgotpassowrd/${userFind._id}/${setUserToken.verifytoken}`
        }

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
         
                res.status(401).json({status:401,message:"email not send"})
            }else{
            
                res.status(201).json({status:201,message:"Email sent Succsfully"})
            }
        })
    }
}
catch(error){
    res.status(401).json({status:401,message:"invalid user"})
}
})




// forgotpassowrd
router.get("/forgotpassword/:id/:token" , async(req,res)=>{
    const{id, token} = req.params
  
    try {
        const validuser = await userdb.findOne({_id:id,verifytoken:token});

        const verifyToken = jwt.verify(token,keysecret);
       

        if(validuser && verifyToken._id){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }

    } catch (error) {
        res.status(401).json({status:401,error})
    }

})




//change the password

router.post("/:id/:token" , async(req,res)=>{
    const {id,token} = req.params
    const {password} = req.body

    try{
        const validuser = await userdb.findOne({_id:id,verifytoken:token});
      
    
        const verifyToken = jwt.verify(token,keysecret);
        console.log(verifyToken._id)
        if(validuser && verifyToken._id){
            const newpassword = await bcrypt.hash(password,12);

            const setnewuserpass = await userdb.findByIdAndUpdate({_id:id},{password:newpassword});
            
            setnewuserpass.save();
            res.status(201).json({status:201,setnewuserpass})
       
        }else{
            console.log("error")
            res.status(401).json({status:401,message:"user not exist"})
        }


    }

    catch(error){

    }

})




export default router