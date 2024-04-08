import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entities/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });
  beforeEach(async () => {
    jwks.start();
    // turncate tables || clear tables data
    await connection.dropDatabase();
    await connection.synchronize();
  });
  afterAll(async () => {
    if (connection.isInitialized) {
      //connection must be instance of Typeorm connection or DataSource
      await connection.destroy();
    }
  });
  afterEach(() => {
    jwks.stop();
  });

  describe("Given all fields", () => {
    it("Should return 200 status code", async () => {
      // Generate token
      const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", `accessToken=${accessToken};`)
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("It should return user data", async () => {
      // Register user
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });
      // Add token to cookies
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", `accessToken=${accessToken};`)
        .send();
      //
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });
    it("should not return password field", async () => {
      // Register user
      const userData = {
        firstName: "Barca",
        lastName: "Kerasiya",
        email: "barca@gmail.com",
        password: "secret",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });
      // Add token to cookies
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", `accessToken=${accessToken};`)
        .send();
      //
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password",
      );
    });
  });
  describe("Fields are missing", () => {});
});
