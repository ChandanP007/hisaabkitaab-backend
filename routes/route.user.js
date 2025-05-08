import { Router } from "express";
import { loginUser, registerUser, verifyOTP, forgotPassword, resetPassword, resendOtp, logoutUser} from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
import { apiLimiter, forgotPasswordLimiter } from "../middlewares/middleware.rateLimit.js";
import { upload } from "../middlewares/middleware.multer.js";
import { updateProfile, getProfile } from "../controllers/controller.profile.js";
import { createCategory, deleteCategoryById, getCategories } from "../controllers/controller.category.js";
import { addNewUserClient, getUserClients } from "../controllers/controller.relation.js";
import { addNewTransaction, deleteTransactionById, getTransactionById, getTransactionDocumentsById, getTransactions, patchTransactionDetailsById, uploadFilesToS3, verifyTransactionById } from "../controllers/controller.transaction.js";
import { generateTransactionId } from "../utils/generateTransactionId.js";
import { getTimelineById, initTimeline, updateTransactionDetailsTimeline, updateVerificationTimeline } from "../controllers/controller.timeline.js";
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
router.get('/clients', authenticate, getUserClients)
router.post('/clients', authenticate, addNewUserClient) 

//category routes
router.get('/categories', authenticate, getCategories)
router.post('/categories', authenticate, createCategory)
router.delete('/categories/:id', authenticate, deleteCategoryById)

//transaction routes
router.get('/transaction', authenticate, getTransactions)
router.get('/transaction/:id',authenticate, getTransactionById)
router.get('/transaction/:id/documents', authenticate, getTransactionDocumentsById)
router.post('/transaction/:id/verify', authenticate, verifyTransactionById, updateVerificationTimeline)
router.post('/transaction', authenticate, generateTransactionId,
    upload.array('documents[]',5),
    uploadFilesToS3,
    addNewTransaction, initTimeline)
router.patch('/transaction/:transactionId/details', authenticate, patchTransactionDetailsById, updateTransactionDetailsTimeline)
router.delete('/transaction/:id', authenticate, deleteTransactionById)

//timeline routes
router.get('/timeline/:id', authenticate, getTimelineById)

export default router;