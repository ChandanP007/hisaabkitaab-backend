import { app } from "../app.js";
import supertest from "supertest";
import User from "../models/model.user.js"

describe("User API", () => {
  it("should register a new user", async () => {
    const response = await supertest(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password",
      role: "buyer",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully"
    );
  });
});

describe("OTP Verification", () => {
  it("should verify OTP and mark user as verified", async () => {
     //save the test user and verify otp
     const user = new User({
          name: "Test User",
          email: "text@example.com",
          password: "password",
          otp: "123456",
          otpExpires: Date.now() + 10*60*1000
     })
     await user.save()

     //is the user verified
     const updateUser = await User.findOne({email: "test@example.com"})
      expect(updateUser.verified).toBe(true)
  });
});

describe("Profile Update", () => {
  it("should update user profile", async () => {
      // Create a test user
      const user = new User({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          verified: true,
      });
      await user.save();

      // Generate a JWT token for the user
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      // Update profile
      const res = await request(app)
          .put("/api/users/profile")
          .set("Authorization", `Bearer ${token}`)
          .send({
              contact: "1234567890",
              address: "123 Main St, City",
              identityType: "aadhaar",
              identityNumber: "1234 5678 9012",
          });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Profile updated successfully");
      expect(res.body.user.contact).toEqual("1234567890");
  });
});