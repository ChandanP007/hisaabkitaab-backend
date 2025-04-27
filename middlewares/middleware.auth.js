import jwt from 'jsonwebtoken'
import {User} from "../models/model.user.js"
import dotenv from 'dotenv'
dotenv.config()

const authenticate = async(req,res,next) => {
    try{
        const authHeader = req.headers['authorization'] 
        const token = req.cookies.token || authHeader && authHeader.split(' ')[1] // Bearer token;

        // console.log("Token "+token);
        if(!token){
            return res.status(401).json({message: "Unauthorized"})
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(verified.userId)
        if(!verified){
            return res.status(401).json({message: "Unauthorized"})
        }

        if(req.path === '/validate-token'){
            return res.status(200).json({message: "Token is valid"})
        }

        req.user = user
        
        next()
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }

}

export default authenticate