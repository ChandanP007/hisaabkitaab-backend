import User from '../models/models.user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { generateOTP } from '../utils/generateOTP.js'
import { sendEmail } from '../services/mailService.js'

export const registerUser = async (req,res) => {
    try{
        const {name, email, password, role, businessName} = req.body

        //validate required fields
        if(!name || !email || !password || !role){
            return res.status(400).json({message: "All fields are required"})
        }

        //check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"})
        }

        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //generate otp
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10*60*1000) //10 minutes

        //create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            businessName,
            otp,
            otpExpires
        })

        await user.save()

        //send otp email
        await sendEmail(
            email,
            "OTP for account verification",
            "otpEmail.html",
            {name,otp}
        )

        res.status(201).json({message: "User registered successfully", userId : user._id})


    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const loginUser = async (req,res) => {
    try{
        const {email, password} = req.body

        //check if user exists
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "User does not exist"})
        }

        //check if password is correct
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"})
        }

        //generate token
        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        res.status(200).json({message: "Login successful", token})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const getProfile = async (req,res) => {
    try{
        const user = await User.findById(req.userId).select('-password')
        res.status(200).json(user)
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}