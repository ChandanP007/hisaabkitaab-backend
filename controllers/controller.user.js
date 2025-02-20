import User from '../models/model.user.js'
import Activity from '../models/model.activity.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { generateOTP } from '../utils/generateOTP.js'
import { sendEmail } from '../services/mailService.js'
import { AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

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
        logger.info(`New User registered: ${email}, IP: ${req.ip}`)

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

export const verifyOTP = async (req,res) => {
    try{
        const {email, otp} = req.body;
        const user = await User.findOne({email, otp, otpExpires: {$gt: Date.now()}})
        if(!user){
            logger.warn(`Invalid or expired OTP entered by : ${email}, IP: ${req.ip}`)
            return res.status(400).json({message: "Invalid or expired OTP"})
        }

        user.verified = true
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

         //send onboarding email
         await sendEmail(
            email,
            "Welcome to HisaabKitaab",
            "welcomeUser.html",
            {name: user.name, dashboard_link: "http://localhost:3000/dashboard"}
        )
        logger.info(`User verified their profile: ${email}, IP: ${req.ip}`)

        res.status(200).json({message: "Account verified successfully"})

    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const updateProfile = async (req,res) => {
    try{
        const userId = req.userId
        const {contact, address, identityType, identityNumber} = req.body

        //validate required fields
        if(!contact || !address || !identityType || !identityNumber){
            return res.status(400).json({message: "All fields are required"})
        }

        //find the user
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({message: "User not found"})
        }

        //update user
        user.contact = contact || user.contact
        user.address = address || user.address
        user.identityType = identityType || user.identityType
        user.identityNumber = identityNumber || user.identityNumber

        await user.save()

        logger.info(`User updated their profile: ${user.email}, IP: ${req.ip}`)

        res.status(200).json({message: "Profile updated successfully", user})
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

        res.status(200).json({message: "Password reset successful"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}

export const deleteProfile = async(req,res) => {
    try{
        const userId = req.user

        //deactivate user
        const user = await User.findByIdAndUpdate(
            userId,
            {isActive: false},
        );

        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        //log activity
        logger.info(`User deleted their profile: ${user.email}, IP: ${req.ip}`)

        res.status(200).json({message: "Profile deleted successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}