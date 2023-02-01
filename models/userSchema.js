import mongoose from "mongoose";
import  Jwt  from "jsonwebtoken";
import validator from "validator";
const keysecret = "amitraat"

const userSchema = new mongoose.Schema({
    fname : {
        type : String , 
        required : true,
        trim :true,
    },

    email : {
        type : String , 
        required : true,
       unique : true,
       validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error("not valid email")
        }
    }
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },

    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    verifytoken :{
        type :String
    }
});












userSchema.methods.generateAuthtoken =  function(){
    try{
        let token23 = Jwt.sign({_id : this._id } , keysecret , {expiresIn : "5d"});

        this.tokens = this.tokens.concat({ token: token23 });
         this.save();
        return token23;

    }
    catch(error){
     
        res.status(422).json(error)

    }
}

const userdb = new mongoose.model("users" ,userSchema)

export default userdb