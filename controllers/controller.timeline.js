import { TransactionTimeline } from "../models/model.transaction.js";


export const initTimeline = async (req, res) => {
    try {
      const transactionId = req.transactionId;
      const performedByUserId = req.user._id;
      const action = "created";
  
      const newTimelineActivity = new TransactionTimeline({
        transactionId,
        performedByUserId,
        action,
      });

      await newTimelineActivity.save();

      if (!newTimelineActivity) {
        return res.status(404).json({ message: "Activity recorded successfull" });
      }
    
      res.status(200).json({ message: "Transaction created succesfull!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
}

export const getTimelineById = async (req, res) => {
    const transactionId = req.params.id;
    try {
        const timeline = await TransactionTimeline.find({ transactionId });
        if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
        }
        res.status(200).json({ timeline });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}