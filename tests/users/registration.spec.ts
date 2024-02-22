import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entities/User";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entities/RefreshToken";

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
    it("Should return the access token and refresh token", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      interface Headers {
        ["set-cookie"]: string[];
      }
      // Assert
      let accessToken = null;
      let refreshToken = null;
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJWT(accessToken)).toBeTruthy();
      expect(isJWT(refreshToken)).toBeTruthy();
    });

    it("Shoud store the refresh token in the database", async () => {
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
      const refreshTokenRepo = connection.getRepository(RefreshToken);
      // const refreshTokens = await refreshTokenRepo.find();
      // expect(refreshTokens).toHaveLength(1);
      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();
      console.log("tokens", tokens);
      expect(tokens).toHaveLength(1);
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
      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(0);
    });
    it("Should return 400 status code if firstName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("Should return 400 status code if lastName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "",
        email: "barca@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("Should return 400 status code if password is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe("Fileds are not in proper format", () => {
    it("Should trim email field", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: " barca@gmail.com ",
        password: "secret",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user[0].email).toBe("barca@gmail.com");
    });

    it("should return 400 status code if email is not valid", async () => {
      // Arrange
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca____@@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it.todo(
      "should return 400 status code if password length is less than 8 char",
    );
    it.todo("should return an array of error messages if email is missing");
  });
});

const isJWT = (token: string | null): boolean => {
  if (token === null) {
    return false;
  }
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }
  try {
    parts.forEach((part) => {
      Buffer.from(part, "base64").toString("utf-8");
    });
    return true;
  } catch (error) {
    return false;
  }
};
