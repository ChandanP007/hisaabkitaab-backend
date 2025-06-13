
import { BusinessRelationship, User } from "../models/model.user.js";


export const getUserClients = async (req, res) => {
  const userId = req.user._id;

  try {

    // Find the user and populate the clients field
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has clients or user is a client of other users
    const relationships = await BusinessRelationship.find({
            isActive: true,
            $or: [
                { primaryBusiness: userId },
                { relatedBusiness: userId }
            ]
        })
        .populate("primaryBusiness")
        .populate("relatedBusiness");

        const clientsSet = new Set();

        relationships.forEach(rel => {
          if (rel.primaryBusiness._id.toString() === userId.toString()) {
              // relatedBusiness is a single user, not an array
              if (rel.relatedBusiness && rel.relatedBusiness._id) {
                  clientsSet.add(rel.relatedBusiness._id.toString());
              }
          } else {
              if (rel.primaryBusiness && rel.primaryBusiness._id) {
                  clientsSet.add(rel.primaryBusiness._id.toString());
              }
          }
      });
      

        // Now get full client details based on IDs in clientsSet
        const clientIds = Array.from(clientsSet);
        const clients = await User.find({ _id: { $in: clientIds } }).select("name email companyName");

        res.status(200).json({ clients });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const addNewUserClient = async (req, res) => {
   try{
    const userId  = req.user._id;
    const newClientData = req.body;
    const { name, email, companyName } = newClientData;

    const newClientExisting = await User.findOne({email: email});

    if (newClientExisting) {
       if(newClientExisting.email == req.user.email){
        return res.status(400).json({ message: "You cannot add yourself as a client" });
        }

        //Bug fix #1: 13/6/25 : User cannot add two clients with same email
        if(newClientExisting.email === email){
          return res.status(400).json({ message: "Client with this email already exists" });
        }

       const newRelationActive = await BusinessRelationship.findOne({
        primaryBusiness: userId,
        relatedBusiness: newClientExisting._id,
        isActive: true,
      });

      const newRelationInactive = await BusinessRelationship.findOne({
        primaryBusiness: userId,
        relatedBusiness: newClientExisting._id,
        isActive: false,
      });


      if (newRelationActive) {
        return res.status(400).json({ message: "Relation already exists" });
      }

      if (newRelationInactive) {
        // Reactivate the existing relationship
        newRelationInactive.isActive = true;
        await newRelationInactive.save();
        return res.status(200).json({ message: "Client added successfully", userId, newClientExisting });
      }

      // Create a new relation
      const relation = new BusinessRelationship({
        primaryBusiness: userId,
        relatedBusiness: newClientExisting._id,
      });
      await relation.save();
      return res.status(200).json({ message: "Client added successfully", userId, newClientExisting });
    }
   

    // Create a new client
    const newClient = new User({
      name,
      email,
      companyName,
    });

    await newClient.save();

    // Create a new relation
    const relation = new BusinessRelationship({
      primaryBusiness: userId,
      relatedBusiness: newClient._id,
    });
    await relation.save();

    res.status(200).json({ message: "Client added successfully", userId, newClientData });

   }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
}

export const removeUserClientById = async (req, res) => {
  const userId = req.user._id;
  const clientEmail = req.body.email;

  try {
    const clientId = await User.findOne({ email: clientEmail }).select("_id");

    // Check if the relationship exists
    const relationship = await BusinessRelationship.findOne({
      primaryBusiness: userId || clientId,
      relatedBusiness: clientId || userId,
      isActive: true,
    });

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Deactivate the relationship
    relationship.isActive = false;
    await relationship.save();

    res.status(200).json({ message: "Client removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
