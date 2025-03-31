import jwt from 'jsonwebtoken'
import {User} from "../models/model.user.js"
import dotenv from 'dotenv'
dotenv.config()

const authenticate = async(req,res,next) => {
    try{

        const token = (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null) 
        || req.session?.token;

        console.log("Headers "+req.headers.authorization);

        console.log("Token "+token);
        if(!token){
            return res.status(401).json({message: "Unauthorized"})
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(verified.userId)
        if(!verified){
            return res.status(401).json({message: "Unauthorized"})
        }

        req.user = user
        // console.log(req.user.role)
        next()
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }

}

export default authenticate