


const documentTypeSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isRequired: { type: Boolean, default: true },
    category: { type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
  });
  
  const documentSchema = new Schema({
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
    documentType: { type: Schema.Types.ObjectId, ref: "DocumentType", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "BusinessProfile", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: {type: Number},
    metadata: {type: Map, of: Schema.Types.Mixed},
    status: {
      type: String,
      enum: ["uploaded", "verified", "rejected"],
      default: "uploaded",
    },
    verificationNote: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  });

export const DocumentType = model("DocumentType", documentTypeSchema);
export const Document = model("Document", documentSchema);

    