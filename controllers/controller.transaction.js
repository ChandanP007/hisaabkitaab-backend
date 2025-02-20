import User from "../models/model.user.js";
import Transaction from "../models/model.transaction.js";
import { sendEmail } from "../services/mailService.js";

export const createTransaction = [
  async (req, res) => {
    try {
      const { title, description, parties, dueDate } = req.body;
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


      //create the transaction
      const transaction = new Transaction({
        business: businessId,
        title,
        description,
        parties,
        // attachments,
        dueDate,
        status: "pending-verification",
      });

      await transaction.save();

      //notify all the parties
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
            transactionId: transaction._id.toString().substring(0, 6),
            dueDate
          }
        );
      }

      res
        .status(201)
        .json({
          message: "Transaction created. Parties have been notified",
          transaction
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const deleteTransaction = async (req, res) => {};
