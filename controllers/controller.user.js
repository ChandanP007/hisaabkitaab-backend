import {User} from '../models/model.user.js'
import Activity from '../models/model.activity.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { generateOTP } from '../utils/generateOTP.js'
import { sendEmail } from '../services/service.mailling.js'
import { AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'


export const registerUser = async (req,res) => {
    try{
        const {name, email, password} = req.body

        //validate required fields
        if(!name || !email || !password ){
            return res.status(400).json({message: "All fields are required"})
        }

        // check if user already exists
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
        logger.info(`New User registered: ${email}, IP: ${req.ip}`)

        res.status(201).json({message: "User registered successfully", userId : user._id})


    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const verifyOTP = async (req,res) => {
    try{
        const {email, otp} = req.body;
        const user = await User.findOne({email, otp, otpExpires: {$gt: Date.now()}})
        if(!user){
            logger.warn(`Invalid or expired OTP entered by : ${email}, IP: ${req.ip}`)
            return res.status(400).json({message: "Invalid or expired OTP"})
        }

        user.emailVerified = true
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

        
        logger.info(`User verified their profile: ${email}, IP: ${req.ip}`)

        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        res.status(200).json({message: "Account verified successfully",token})

    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const resendOtp = async (req,res) => {
    try{
        const {name, email} = req.body

        //check if user exists
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({message: "User does not exist"})
        }

        //generate otp
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10*60*1000) //10 minutes

        //update user
        user.otp = otp
        user.otpExpires = otpExpires
        await user.save()

        //send otp email
        await sendEmail(
            email,
            "OTP for account verification",
            "otpEmail.html",
            {name,otp}
        )

        res.status(200).json({message: "OTP sent successfully"})
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
            logger.warn(`Login attempt with non-existent email: ${email}, IP: ${req.ip}`)
            return res.status(400).json({message: "User does not exist"})
        }

        //check if password is correct
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            logger.warn(`Login attempt with incorrect password: ${email}, IP: ${req.ip}`)
            return res.status(400).json({message: "Invalid credentials"})
        }

        //generate token
        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        //log activity
        logger.info(`User logged in: ${email}, IP: ${req.ip}`)

        res.status(200).json({message: "Login successful", token})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const logoutUser = async (req,res) => {
    try{
        res.clearCookie('token').status(200).json({message: "Logout successful"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const resetPassword = async(req,res) => {
    try{
        const { token } = req.params
        const { newPassword } = req.body

        //find the user with the token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({message: "Invalid or expired token"})
        }

        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword,salt)

        //update password
        user.password = hashedPassword
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()

        await Activity.create({
            user: user._id,
            action: "password_reset",
            metadata: { ip: req.ip}
        })

        logger.info(`User ${email} reset their password from IP: ${req.ip}`)

        res.status(200).json({message: "Password reset successful"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const forgotPassword = async (req,res) => {
    try{
        const {email} = req.body

        //find user
        const user = await User.findOne({email})
        if(!user){
            throw new AppError("User not found", 404)
        }

        //generate reset token
        const resetToken = crypto.randomUUID(20).toString('hex')
        user.passwordResetToken = resetToken
        user.passwordResetExpires = Date.now() + 10*60*1000 //10 minutes
        await user.save()

        //send reset email
        await sendEmail(
            email,
            "Password Reset Request",
            "passwordResetEmail.html",
            {name: user.name, reset_link: `http://localhost:5000/reset-password/${resetToken}`}
        )

        res.status(200).json({message: "Password reset link sent to your email", reset_link : `http://localhost:5000/reset-password/${resetToken}`})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}


