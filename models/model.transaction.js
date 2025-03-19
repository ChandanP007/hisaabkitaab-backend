import {Schema, model} from 'mongoose';


  const transactionSchema = new Schema({
    transactionNumber: { type: String, required: true, unique: true },
    agent: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "initiated",
        "in_progress",
        "pending",
        "completed",
        "cancelled"
      ],
      default: "draft",
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    completedAt: { type: Date },
    parties: [{
      business: { type: Schema.Types.ObjectId, ref: "BusinessProfile" },
      role: { type: String, required: true},
      status: {
        type: String,
        enum: ["pending", "notified", "documents_uploaded", "verified", "rejected"],
        default: "pending",
      },
      notes: { type: String },
    }],
    documents: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    history: [{ type: Schema.Types.ObjectId, ref: "TransactionHistory" }],
    verification: [{ type: Schema.Types.ObjectId, ref: "User"}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  });


export const Transaction = model("Transaction", transactionSchema);
