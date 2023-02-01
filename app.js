import express from "express"
import "./dataConnect/Connect.js"
import router from "./routes/router.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import nodemailer from "nodemailer"




const app = express()
const PORT = 8009


app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(router)


app.listen(PORT , ()=>{
    console.log(`server sucessfullt run at :${PORT}`)
})