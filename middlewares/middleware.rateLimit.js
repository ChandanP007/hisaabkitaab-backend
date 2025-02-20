import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many requests, please try again after 15 minutes",
})


//general rate limiting
export const apiLimiter = rateLimit({
    windowsMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
})