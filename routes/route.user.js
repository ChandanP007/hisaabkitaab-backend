import { Router } from "express";
import { loginUser, registerUser, verifyOTP, forgotPassword, resetPassword, resendOtp, logoutUser} from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
import { apiLimiter, forgotPasswordLimiter } from "../middlewares/middleware.rateLimit.js";
import { upload } from "../middlewares/middleware.multer.js";
import {  createBusinessProfile, getProfile, searchProfileById, updateProfile } from "../controllers/controller.profile.js";
import { addClientRelation, getAllClientRelations } from "../controllers/controller.relation.js";
import { createCategory, deleteCategoryById, getCategories, partialUpdateCategory } from "../controllers/controller.category.js";
const router = Router();
router.use(apiLimiter)


//user routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/resend-otp', resendOtp)
router.post('/verify-otp',verifyOTP)
router.post('/forgot-password', forgotPasswordLimiter ,forgotPassword)
router.post('/reset-password/:token',resetPassword)

//profile routes
router.post('/new-profile', authenticate, upload.single('file'), createBusinessProfile)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, upload.single('file'), updateProfile)
router.post('/search/:id', searchProfileById);

//clients and relation
router.post('/add-relationship', authenticate, addClientRelation);
router.get('/get-clients', authenticate, getAllClientRelations)


//category routes
router.get('/categories', authenticate, getCategories)
router.post('/categories', authenticate, createCategory)
router.post('/categories/update', authenticate, partialUpdateCategory)
router.delete('/categories/:id', authenticate, deleteCategoryById)

export default router;