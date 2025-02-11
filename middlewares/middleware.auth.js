import jwt from 'jsonwebtoken'

const authenticate = (req,res,next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ','')

        if(!token){
            return res.status(401).json({message: "Unauthorized"})
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if(!verified){
            return res.status(401).json({message: "Unauthorized"})
        }

        req.userId = verified.userId
        next()
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }

}

export default authenticate