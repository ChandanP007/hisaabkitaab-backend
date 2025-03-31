import User from "../models/model.user.js";
import Transaction from "../models/model.transaction.js";
import { sendEmail } from "../services/service.mailling.js";
import { generateReceiptPDF } from "../services/service.generatepdf.js";
import { deleteFromBucket, uploadToBucket } from "../services/service.s3.js";

export const createTransaction = async (req, res) => {
  try {
    const { title, description, parties, dueDate, notify } = req.body.jsonData ? JSON.parse(req.body.jsonData) : req.body;
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
      attachments : attachments.map((file) => ({
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

export const uploadFilesToS3 = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const files = req.files;

    if (!files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    //check if user has enough capacity to upload files
    const user = await User.findById(userId);

    const maxFiles = user.membershipType === "pro" ? 10 : 2;
    if (files.length > maxFiles) {
      return res.status(400).json({
        message: `You can upload upto ${maxFiles} files, Upgrade to increase the capacity`,
      });
    }

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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTransaction = async (req, res) => {
   try{
        const {transactionId} = req.params
        const userId = req.user._id

        // check if transaction exists
        if(!transactionId){
            return res.status(400).json({message: "Transaction ID is required"})
        }

        // check if transaction belongs to the business
        const transaction = await Transaction.findOne({transactionId, business: userId})
        if(!transaction){
            return res.status(400).json({message: "Transaction not found"})
        }

        // delete the transaction from db
        await transaction.deleteOne()

        //delete the files from the bucket 
        await Promise.all(transaction.attachments.map(async (attachment) => {
            await deleteFromBucket(attachment.name, userId)
        }))

        logger.info(`Transaction ${transactionId} deleted by ${userId} from ${req.ip}`)

        res.status(200).json({message: "Transaction deleted successfully"})

   }
   catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
   }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ business: userId });
    res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}