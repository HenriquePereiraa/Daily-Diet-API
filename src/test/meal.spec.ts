import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app";
import { execSync } from "child_process";
import request from "supertest";

describe("meal router", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  // it("should be able create meal", async () => {
  //   const createUser = await request(app.server)
  //     .post("/user")
  //     .send({
  //       name: "test",
  //       email: "test@test.com",
  //     })
  //     .expect(201);

  //   const cookie = createUser.get("Set-Cookie");

  //   await request(app.server)
  //     .post("/meal")
  //     .set("Cookie", cookie)
  //     .send({
  //       name: "Arroz com ovo",
  //       description: "Pos treino",
  //       in_diet: true,
  //     })
  //     .expect(201);
  // });

  // it("should be able to list all meal the user", async () => {
  //   const createUser = await request(app.server)
  //     .post("/user")
  //     .send({
  //       name: "test",
  //       email: "test@test.com",
  //     })
  //     .expect(201);

  //   const cookie = createUser.get("Set-Cookie");

  //   await request(app.server).get("/meal").set("Cookie", cookie).expect(200);
  // });

  it("should be able to get the meal by id", async () => {
    const createUser = await request(app.server)
      .post("/user")
      .send({
        name: "test",
        email: "test@test.com",
      })
      .expect(201);

    const cookie = createUser.get("Set-Cookie");

    await request(app.server)
      .post("/meal")
      .set("Cookie", cookie)
      .send({
        name: "Arroz com ovo",
        description: "Pos treino",
        in_diet: true,
      })
      .expect(201);

    const allMeals = await request(app.server)
      .get("/meal")
      .set("Cookie", cookie)
      .expect(200);

    const meal_id = allMeals.body[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meal/${meal_id}`)
      .expect(200);

    expect(getMealResponse.body).toEqual(
      expect.objectContaining({
        name: "Arroz com ovo",
        description: "Pos treino",
        in_diet: 1,
      })
    );
  });
});
