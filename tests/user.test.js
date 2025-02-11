import { app } from "../app.js"
import supertest from "supertest"

describe("User API", () => {
    it("should register a new user", async() => {
        const response = await supertest(app)
        .post("/api/users/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password",
          role: "buyer"
        })
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("message", "User registered successfully")
    })
})