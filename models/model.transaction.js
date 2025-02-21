import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
    transactionId: {type: String, required: true},
    business: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {type: String, required: true},
    description: {type: String},
    parties: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ['buyer', 'seller', 'transporter', 'agent'],
                required: true
            },
            verified: {type: Boolean, default: false},
        }
    ],
    attachments: [
        {
            url: {type: String, required: true},
            name: {type: String, required: true}
        }
    ],
    status: {
        type: String,
        enum: ['draft','pending-verification','verified','completed','cancelled'],
        default: 'draft'
    },
    dueDate: {type: Date},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

export default model("Transaction", TransactionSchema)