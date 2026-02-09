import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";

describe("GET /api/v1/", () => {
  /*
  @description Responds with a JSON message indicating API is running
  @expected 200 OK
  */
  it("responds with a json message", () =>
    request(app)
      .get("/api/v1/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, {
        message: "🟢 API OPERATIONAL",
      }));
});

describe("GET /api/v1/emojis", () => {
  /*
  @description Responds with 404 for a non-existent route
  @expected 404 Not Found
  */
  it("responds with 404 for non-existent route", () =>
    request(app)
      .get("/api/v1/emojis")
      .set("Accept", "application/json")
      .expect(404));
});
