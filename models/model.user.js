import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    businessName: {type: String},
    gstNumber: {type: String},
    address: {type: String},
    contact: {type: String},
    isWhatsapp: {type: Boolean, default: false},
    identityType: {type: String, enum: ['aadhaar','pan','license']},
    identityNumber: {type: String},
    identityUrl: {type: String},
    identityVerified: {type: Boolean, default: false},
    identityAttachment: {type: String},
    identityVerified: {type: Boolean, default: false},
    emailVerified: {type: Boolean, default: false},
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