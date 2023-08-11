import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app";
import { execSync } from "child_process";
import request from "supertest";

describe("user route", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

    it("Should be able to create a new user", async () => {
      await request(app.server)
        .post("/user")
        .send({
          name: "test",
          email: "test@test.com",
        })
        .expect(201);
    });

  it("Should be able to get a specific user", async () => {
    const createUser = await request(app.server)
      .post("/user")
      .send({
        name: "test",
        email: "test@test.com",
      })
      .expect(201);

    const setCookie = createUser.get("Set-Cookie");
    const cookie = setCookie[0].split(';')[0].split("=")[1];

    const getUserResponse = await request(app.server)
      .get(`/user/${cookie}`)
      .expect(200);

    expect(getUserResponse.body).toEqual(
      expect.objectContaining({
        name: "test",
        email: "test@test.com",
      })
    );
  });
});
