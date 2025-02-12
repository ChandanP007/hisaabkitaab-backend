

const checkRole = (roles) => (req,res,next) => {
    const user = req.user
    if(!roles.includes(user.role)){
        return res.status(403).json({message: "Access Denied"})
    }

    next()
}

export default checkRole