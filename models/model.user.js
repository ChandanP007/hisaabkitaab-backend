import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: ['business','buyer','transporter','seller','admin','agent'],
        required: true
    },
    businessName: {type: String},
    contact: {type: String},
    address: {type: String},
    identityType: {type: String, enum: ['aadhaar','pan','license']},
    identityNumber: {type: String},
    verified: {type: Boolean, default: false},
    membershipType: {type: String, enum: ['free','pro','enterprise'], default: 'free'},
    membershipExpires: {type: Date, default: undefined},
    createdAt: {type: Date, default: Date.now},
    isActive: {type: Boolean, default: true},
    otp: {type: String},
    otpExpires: {type: Date},
    passwordResetToken: {type: String},
    passwordResetExpires: {type: Date}
})

export default model("User", UserSchema)