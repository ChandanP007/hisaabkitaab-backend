import express from 'express';
import multer from 'multer';
import path from 'path';

// Set up memory storage (files will be stored in memory)
const storage = multer.memoryStorage();

// Initialize multer with memory storage
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
})