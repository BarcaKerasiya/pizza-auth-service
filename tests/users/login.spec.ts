import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });
  beforeEach(async () => {
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

  describe("Given all fields", () => {
    it("test", () => {
      expect(200).toBe(200);
    });
  });
  // describe("Fields are missing", () => {});
});
