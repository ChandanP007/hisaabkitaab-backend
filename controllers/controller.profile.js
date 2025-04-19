import {
  BusinessProfile,
  User,
} from "../models/model.user.js";
import { AgentProfile } from "../models/model.user.js";

export const createBusinessProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const formData = req.body;

    const { role, businessName, gstNumber, panNumber, agentName } = formData;

    if (role === "agent") {
      //check if agent already exists
      const agentExists = await AgentProfile.findOne({ panNumber });
      if (agentExists) {
        return res.status(400).json({ message: "Agent already exists" });
      }

      //create agent profile
      const agentProfile = new AgentProfile({
        user: userId,
        agentName,
        panNumber,
      });

      await agentProfile.save();
      res.status(200).json({ message: "Agent profile created successfully" });
    }

    if (role === "business") {
      //check if business already exists
      const businessExists = await BusinessProfile.findOne({ gstNumber });
      if (businessExists) {
        return res.status(400).json({ message: "Business already exists" });
      }

      //create business profile
      const businessProfile = new BusinessProfile({
        user: userId,
        businessName,
        gstNumber,
        panNumber,
      });

      await businessProfile.save();
      res
        .status(200)
        .json({ message: "Business profile created successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID provided" });
    }

    // Fetch user from database
    const user = await User.findById(req.user._id).select("-password");

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Send response
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);

    // Handle Mongoose-specific errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    //find the agent/business profile with id
    const agentProfile = await AgentProfile.findOne({ panNumber: id });
    const businessProfile = await BusinessProfile.findOne({ gstNumber: id });

    if (agentProfile) {
      return res.status(200).json({ profile: agentProfile, type: "agent" });
    }
    if (businessProfile) {
      return res
        .status(200)
        .json({ profile: businessProfile, type: "business" });
    }
    return res.status(404).json({ message: "Profile not found" });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user;

    //deactivate user
    const user = await User.findByIdAndUpdate(userId, { isActive: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //log activity
    logger.info(`User deleted their profile: ${user.email}, IP: ${req.ip}`);

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      businessName,
      gstNumber,
      address,
      contact,
      isWhatsapp,
      idType,
      idNumber,
    } = JSON.parse(req.body.jsonData);

    //validate required fields
    if (
      !businessName ||
      !gstNumber ||
      !address ||
      !contact ||
      !idType ||
      !idNumber
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(userId);

    //find the user
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //uploading the identity document to s3 bucket
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or incorrect field name" });
    }

    const identityDocument = req.file.buffer;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const location = "identity";
    const result = await uploadToBucket(
      identityDocument,
      fileName,
      fileType,
      userId,
      location
    );
    if (!result) {
      return res
        .status(500)
        .json({ message: "Error uploading identity document" });
    }
    const fileUrl = result.Location;

    //update user
    user.businessName = businessName;
    user.gstNumber = gstNumber;
    user.address = address || user.address;
    user.contact = contact || user.contact;
    user.isWhatsapp = isWhatsapp || user.isWhatsapp;
    user.identityType = idType || user.identityType;
    user.identityNumber = idNumber || user.identityNumber;
    user.identityAttachment = fileUrl;

    await user.save();

    logger.info(`User updated their profile: ${user.email}, IP: ${req.ip}`);

    res
      .status(200)
      .json({
        message: "Profile updated successfully",
        user,
        fileUrl: fileUrl,
      });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
