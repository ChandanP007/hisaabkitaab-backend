import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ["agent", "business"],
    default: "business",
    required: true,
  },
  gstNumber: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
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

const businessProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  panNumber: { type: String, required: true },
  address: { type: String},
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const agentProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  agentName: { type: String, required: true },
  panNumber: { type: String, required: true },
  rating: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const businessRelationshipSchema = new Schema({
  primaryBusiness: {
    type: Schema.Types.ObjectId,
    ref: "BusinessProfile" || "AgentProfile",
    required: true,
  },
  relatedBusiness: {
    type: Schema.Types.ObjectId,
    ref: "BusinessProfile" || "AgentProfile",
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});





export const User = model("User", userSchema);
export const BusinessProfile = model("BusinessProfile", businessProfileSchema);
export const AgentProfile = model("AgentProfile", agentProfileSchema);
export const BusinessRelationship = model("BusinessRelationship", businessRelationshipSchema);
