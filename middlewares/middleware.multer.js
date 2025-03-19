import multer from "multer";

// Set up memory storage (keeps files in RAM, does NOT save them to disk)
const storage = multer.memoryStorage();

// Initialize Multer to handle file uploads from `formData.files`
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});
