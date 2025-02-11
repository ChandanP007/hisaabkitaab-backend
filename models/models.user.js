import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: ['business','buyer','transporter','seller'],
        required: true
    },
    businessName: {type: String},
    contact: {type: String},
    address: {type: String},
    identityType: {type: String, enum: ['aadhar','pan','license']},
    identityNumber: {type: String},
    verified: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    isActive: {type: Boolean, default: true},
    otp: {type: String},
    otpExpires: {type: Date}
})

export default model("User", UserSchema)