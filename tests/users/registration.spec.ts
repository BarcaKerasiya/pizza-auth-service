import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });
  beforeEach(async () => {
    // turncate tables || clear tables data
    await connection.dropDatabase();
    await connection.synchronize();
    // await truncateTables(connection);
  });
  afterAll(async () => {
    if (connection.isInitialized) {
      //connection must be instance of Typeorm connection or DataSource
      await connection.destroy();
    }
  });

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
    it("It should persist user in database", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(1);
      expect(user[0].firstName).toBe(userData.firstName);
      expect(user[0].lastName).toBe(userData.lastName);
      expect(user[0].email).toBe(userData.email);
    });
    it("Shuold return an id of created user ", () => {});
    it("Should assign a customer role", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user[0]).toHaveProperty("role");
      expect(user[0].role).toBe(Roles.CUSTOMER);
    });
    it("Should store hashed password in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      console.log(user[0].password);
      expect(user[0].password).not.toBe(userData.password);
      expect(user[0].password).toHaveLength(60);
      expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
    });
    it("Should return 400 status code if email is already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });
  describe("Fields are missing", () => {
    it("Should return 400 status code if email filed is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      console.log("response", response.body);
      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
});
