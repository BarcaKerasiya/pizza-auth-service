import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.statusCode).toBe(201);
    });
    it("Should return valid json", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });
  });
  describe("Fields are missing", () => {});
});
