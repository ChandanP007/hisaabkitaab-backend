import {Schema, model} from 'mongoose';


  const transactionSchema = new Schema({
    transactionId: { type: String, required: true, unique: true },
    ownerEmailId: { type: String, required: true },
    createdBy: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: [
        "draft",
        "inprogress",
        "completed",
        "cancelled"
      ],
      default: "draft",
    },
    completedAt: { type: Date },
    collaborators: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    documents: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    verifiedBy: [{ type: String}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  });

const transactionTimelineSchema = new Schema({
  transactionId: { type: String, required: true },
  action: {
    type: String,
    enum: [
      "created",
      "updated",
      "deleted",
      "completed",
      "cancelled",
      "verified"
    ],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  performedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
});



export const Transaction = model("Transaction", transactionSchema);
export const TransactionTimeline = model("TransactionTimeline", transactionTimelineSchema);