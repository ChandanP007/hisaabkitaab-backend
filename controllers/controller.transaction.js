import {User} from "../models/model.user.js";
import {Transaction} from "../models/model.transaction.js";
import { sendEmail } from "../services/service.mailling.js";
import { deleteFromBucket, uploadToBucket } from "../services/service.s3.js";
import { generateTransactionId } from "../utils/generateTransactionId.js";

export const createTransaction = async (req, res) => {
  try {
    const { title, description, parties, dueDate, notify } = req.body.jsonData
      ? JSON.parse(req.body.jsonData)
      : req.body;
    const businessId = req.user._id;

    //validate required fields
    if (!title || !parties || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //validate parties
    const users = await User.find({
      _id: { $in: parties.map((p) => p.user) },
    });
    if (users.length !== parties.length) {
      return res.status(400).json({ message: "Invalid party user(s)" });
    }

    // get the attachements
    const attachments = req.files || [];

    //create the transaction
    const transaction = new Transaction({
      transactionId: req.transactionId,
      business: businessId,
      title,
      description,
      parties,
      attachments: attachments.map((file) => ({
        url: file,
        name: file.split("/").pop(),
      })),
      dueDate,
      status: "pending-verification",
    });

    await transaction.save();
    // await generateReceiptPDF(transaction, `../receipts/${transaction._id}.pdf`);

    //notify all the parties
    if (notify == "true") {
      const business = await User.findById(businessId);
      for (const party of parties) {
        const user = await User.findById(party.user);

        //send email
        await sendEmail(
          user.email,
          "New transaction created",
          "transactionNotification.html",
          {
            userName: user.name,
            businessName: business.name,
            transactionTitle: title,
            transactionId: req.transactionId,
            dueDate,
          }
        );
      }
    }

    res.status(201).json({
      message: "Transaction created. Parties have been notified",
      transaction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNewTransaction = async (req, res) => {
  try {
    const { title, description, parties, deadline } = req.body.formData
      ? JSON.parse(req.body.formData)
      : req.body;
    const files = req.files;

    //validate required fields
    if (!title || !parties || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //validate parties
    // const users = await User.find({
    //   _id: { $in: parties.map((p) => p.user) },
    // });

    // if (users.length !== parties.length) {
    //   return res.status(400).json({ message: "Invalid party user(s)" });
    // }

    //get the parties
    const partiesInvolved = JSON.parse(parties).map((party) => ({
      user: party,
      acknowledged: false,
    }));

    //get the attachments
    const attachments = files.map((file) => ({
      url: file,
      title: file.split("/").pop(),
    }));

    //create the transaction
    const transaction = new Transaction({
      transactionId: req.transactionId,
      createdBy: req.user._id,
      title,
      description,
      parties: partiesInvolved,
      attachments,
      dueDate: deadline,
      status: "pending",
    });

    await transaction.save();

    res
      .status(200)
      .json({
        message: "Transaction created successfully",
        transaction: transaction,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Server Responded with Error : 500` });
  }
};

export const uploadFilesToS3 = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const files = req.files;

    if (!files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    //check if user has enough capacity to upload files
    const user = await User.findById(userId);

    // const maxFiles = user.membershipType === "pro" ? 10 : 2;
    // if (files.length > maxFiles) {
    //   return res.status(400).json({
    //     message: `You can upload upto ${maxFiles} files, Upgrade to increase the capacity`,
    //   });
    // }

    //upload files to bucket
    const fileUrls = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToBucket(
          file.buffer,
          req.transactionId + "_" + file.originalname,
          file.mimetype,
          userId,
          "transaction"
        );
        return result.Location;
      })
    );

    // res.status(200).json({ message: "Files uploaded", fileUrls });
    req.files = fileUrls;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error hai" });
  }
};



export const getTransactions = async (req, res) => {
  const userId = req.user._id;
  try {
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }



    const transactions = await Transaction.find({
      $or: [
        { createdBy: user.email },
        { collaborators: {$in: [user._id]} },
        { ownerEmailId: user.email },
      ]
    })


    res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTransactionById = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user._id;

  try {
    const transaction = await Transaction.findOne({
      transactionId: transactionId
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const addNewTransaction = async (req, res, next) => {
      const userId = req.user._id;

      try{
         const newTransactionData = req.body;
         const {transactionTitle, description, ownerEmail, collaborators} = newTransactionData
        //  console.log(newTransactionData)


          //validate required fields
          if (!transactionTitle || !ownerEmail || !collaborators) {
            return res.status(400).json({ message: "All fields are required" });
          }

          //take out the collaborators email ids 
          const collaboratorsEmail = collaborators.map((collaborator) => collaborator.email)

          const collaboratorsProfiles = await User.find({
            email: { $in: collaboratorsEmail },
          });

          const user = await User.findById(userId);

          const newTransaction = {
            transactionId: req.transactionId,
            ownerEmailId: ownerEmail,
            createdBy: user.email,
            title: transactionTitle,
            description: description,
            status: "draft",
            collaborators: collaboratorsProfiles

          }

          //create the transaction
          const transaction = new Transaction(newTransaction);

          await transaction.save();

          next();

      }
      catch(error){
          console.log(error)
          res.status(500).json({message: "Internal server error"})
      }
}

