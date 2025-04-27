import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String},
  address: { type: String },
  password: { type: String },
  gstNumber: { type: String },
  isActive: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  otp: { type: String },
  otpExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  membershipType: { type: String, enum: ["free", "premium"], default: "free" },
  profileImage: { type: String },
});

const businessRelationshipSchema = new Schema({
  primaryBusiness: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  relatedBusiness: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});





export const User = model("User", userSchema);
export const BusinessRelationship = model("BusinessRelationship", businessRelationshipSchema);
