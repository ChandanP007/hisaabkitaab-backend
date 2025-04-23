import { Router } from "express";
import { loginUser, registerUser, verifyOTP, forgotPassword, resetPassword, resendOtp, logoutUser} from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
import { apiLimiter, forgotPasswordLimiter } from "../middlewares/middleware.rateLimit.js";
import { upload } from "../middlewares/middleware.multer.js";
import { updateProfile, getProfile } from "../controllers/controller.profile.js";
import { createCategory, deleteCategoryById, getCategories } from "../controllers/controller.category.js";
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
router.post('/validate-token', authenticate)

//profile routes
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate,  updateProfile)

//clients and relation


//category routes
router.get('/categories', authenticate, getCategories)
router.post('/categories', authenticate, createCategory)
router.delete('/categories/:id', authenticate, deleteCategoryById)

//transaction routes


export default router;