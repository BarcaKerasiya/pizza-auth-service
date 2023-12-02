import app from "./src/app";
import { calculateDiscount } from "./src/config/utils";
import request from "supertest";

describe.skip("app", () => {
  it("shoud calculate the discount price", () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(10);
  });

  it("should return 200 status", async () => {
    const response = await request(app).get("/").send();
    expect(response.statusCode).toBe(200);
  });
});
