import { Router } from "express";
import { loginUser, registerUser, verifyOTP, forgotPassword, resetPassword, resendOtp, logoutUser} from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
import { apiLimiter, forgotPasswordLimiter } from "../middlewares/middleware.rateLimit.js";
import { upload } from "../middlewares/middleware.multer.js";
import { addClientRelation, createBusinessProfile, getAllClientRelations, getProfile, searchProfileById, updateProfile } from "../controllers/conroller.profile.js";
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
router.post('/add-relationship/:clientId', authenticate, addClientRelation);
router.get('/get-clients', authenticate, getAllClientRelations)

export default router;