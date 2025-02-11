import { Router } from "express";
import { getProfile, loginUser, registerUser } from "../controllers/controller.user.js";
import authenticate from "../middlewares/middleware.auth.js";
const router = Router();


//user routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', authenticate, getProfile)

export default router;