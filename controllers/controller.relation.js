import { Types } from "mongoose";
import { AgentProfile, BusinessProfile, BusinessRelationship, User } from "../models/model.user.js";


export const addClientRelation = async (req, res) => {
  try {
    let { clientId } = req.body;
    clientId = new Types.ObjectId(clientId); // Convert clientId to ObjectId
    const userId = req.user._id;

    console.log("Client ID:", clientId);
    console.log("User ID:", userId);

    // Check if the client ID is valid
    if (!clientId || clientId === userId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Fetch user and client profiles
    const clientProfile =
      (await BusinessProfile.findOne({ _id: clientId })) ||
      (await AgentProfile.findOne({ _id: clientId }));
    const userProfile =
      (await BusinessProfile.findOne({ user: userId })) ||
      (await AgentProfile.findOne({ user: userId }));

    if (!userProfile || !clientProfile) {
      return res
        .status(404)
        .json({ message: "User or clients profile not found" });
    }

    if (!userProfile || !clientProfile) {
      return res
        .status(404)
        .json({ message: "User or client profile not found" });
    }

    // check if the client ID is already in the user's client list
    const relationExist = await BusinessRelationship.findOne({
      primaryBusiness: userProfile._id,
      relatedBusiness: clientProfile._id,
    });

    if (relationExist) {
      return res
        .status(400)
        .json({ message: "Client relation already exists" });
    }

    // Create a new client relation
    const newRelation = new BusinessRelationship({
      primaryBusiness: userProfile._id,
      relatedBusiness: clientProfile._id,
    });
    await newRelation.save();

    res
      .status(200)
      .json({ message: "Client relation added successfully", newRelation });
  } catch (error) {
    console.error("Error adding client relation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllClientRelations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user business profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userProfile = null;
    if (user.role == "agent") {
      userProfile = await AgentProfile.findOne({ user: userId });
    } else if (user.role == "business") {
      userProfile = await BusinessProfile.findOne({ user: userId });
    }

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const relations = await BusinessRelationship.find({
      $or: [
        { primaryBusiness: userProfile._id },
        { relatedBusiness: userProfile._id },
      ],
    });

    if (!relations || relations.length === 0) {
      return res.status(404).json({ message: "No client relations found" });
    }

    // 3. Extract all the "other" business IDs (not the logged-in user)
    const clientIdsSet = new Set();

    relations.forEach((relation) => {
      const primaryId = relation.primaryBusiness?._id.toString();
      const relatedId = relation.relatedBusiness?._id.toString();
      const userIdStr = userProfile._id.toString();

      if (primaryId !== userIdStr) clientIdsSet.add(primaryId);
      if (relatedId !== userIdStr) clientIdsSet.add(relatedId);
    });

    // 4. Convert set to array of ObjectIds
    const clientBusinessIds = [...clientIdsSet].map(
      (id) => new Types.ObjectId(id)
    );

    // 5. Fetch client profiles from both collections
    const businessClients = await BusinessProfile.find({
      _id: { $in: clientBusinessIds },
    });
    const agentClients = await AgentProfile.find({
      _id: { $in: clientBusinessIds },
    });

    // 6. Merge them into a single array
    const allClients = [...businessClients, ...agentClients];

    // 7. Send the data
    res.status(200).json({ clients: allClients });
  } catch (error) {
    console.error("Error fetching client relations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
