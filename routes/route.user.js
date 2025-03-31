import { Router } from "express";
import { getProfile, loginUser, registerUser, updateProfile, verifyOTP, deleteProfile, forgotPassword, resetPassword, resendOtp} from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
import { apiLimiter, forgotPasswordLimiter } from "../middlewares/middleware.rateLimit.js";
import { upload } from "../middlewares/middleware.multer.js";
const router = Router();


//user routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/resend-otp', resendOtp)
router.post('/verify-otp',verifyOTP)
router.post('/forgot-password', forgotPasswordLimiter ,forgotPassword)
router.post('/reset-password/:token',resetPassword)
router.get('/profile', authenticate, getProfile)
router.delete('/profile',authenticate, deleteProfile)
router.put('/profile', authenticate, upload.single('file'), updateProfile)

router.use(apiLimiter)


export default router;