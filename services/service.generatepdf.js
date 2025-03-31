import PDFDocument from "pdfkit";
import fs from "fs";

export const generateReceiptPDF = (transaction, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    // Create a write stream to save the PDF
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add content to the PDF
    doc.fontSize(25).text("Transaction Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Transaction ID: ${transaction._id}`);
    doc.text(`Date: ${transaction.createdAt.toLocaleString()}`);
    doc.text(`Amount: $${transaction.amount}`);
    doc.text(`Type: ${transaction.type}`);
    doc.text(`Category: ${transaction.category}`);
    doc.moveDown();
    doc.text("Thank you for using HisaabKitaab!");

    // Finalize the PDF
    doc.end();

    // Resolve when the PDF is generated
    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
  });
};