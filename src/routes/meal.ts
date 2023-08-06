import { FastifyInstance } from "fastify";
import { object, string, z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

interface Meal {
  id: string;
  name: string;
  description: string;
  created_at: string;
  in_diet: boolean;
  user_meal_id: string;
}

export async function mealRoute(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    try {
      const { sessionId } = request.cookies;

      if (!sessionId) {
        reply.status(400).send();
        throw new Error("Cookie not found!");
      }

      const user = await knex("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const { id } = user;

      const mealDataBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        in_diet: z.boolean(),
      });

      const { name, description, in_diet } = mealDataBodySchema.parse(
        request.body
      );

      if (
        !name ||
        !name.trim() ||
        !description ||
        !description.trim() ||
        in_diet === undefined
      ) {
        reply.status(400).send();
        throw new Error("incomplete information!");
      }

      await knex("meal").insert({
        id: randomUUID(),
        name,
        description,
        in_diet,
        user_meal_id: id,
      });
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.get("/", async (request, reply) => {
    try {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      });

      const { sessionId } = sessionIdSchema.parse(request.cookies);

      const user = await knex("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const meals = await knex("meal").where({
        user_meal_id: user.id,
      });

      return reply.status(201).send(meals);
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.get("/:id", async (request, reply) => {
    try {
      const idParamsSchema = z.object({
        id: string().uuid(),
      });

      const { id } = idParamsSchema.parse(request.params);

      const meal = await knex("meal").where({
        id,
      });

      return reply.status(201).send(meal);
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.get("/amount-meals", async (request, reply) => {
    try {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      });

      const { sessionId } = sessionIdSchema.parse(request.cookies);

      const user = await knex("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const amountMeals = await knex("meal")
        .where({
          user_meal_id: user.id,
        })
        .count("id", { as: "count" })
        .first();

      return reply.status(200).send(amountMeals);
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error when counting" });
    }
  });

  app.get("/in-diet", async (request, reply) => {
    try {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      });

      const { sessionId } = sessionIdSchema.parse(request.cookies);

      const user = await knex("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const amountMealsInDiet = await knex("meal")
        .where({
          user_meal_id: user.id,
          in_diet: true,
        }).count("id",{as:"count"})
        .first();

      return reply.status(200).send(amountMealsInDiet);
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error when counting" });
    }
  });

  app.get("/out-diet", async (request, reply) => {
    try {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      });

      const { sessionId } = sessionIdSchema.parse(request.cookies);

      const user = await knex("users")
        .where({
          session_id: sessionId,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const amountMealsInDiet = await knex("meal")
        .where({
          user_meal_id: user.id,
          in_diet: false,
        }).count("id",{as:"count"})
        .first();

      return reply.status(200).send(amountMealsInDiet);
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error when counting" });
    }
  });

  app.put("/:id", async (request, reply) => {
    try {
      const idParamsSchema = z.object({
        id: string().uuid(),
      });

      const { id } = idParamsSchema.parse(request.params);

      const dataMealBodySchema = z.object({
        name: z.string().nonempty(),
        description: z.string().nonempty(),
        in_diet: z.boolean(),
      });

      const { name, description, in_diet } = dataMealBodySchema.parse(
        request.body
      );

      await knex("meal")
        .where({
          id,
        })
        .update({
          name,
          description,
          in_diet,
        });
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.message);
    }
  });

  app.patch("/:id", async (request, reply) => {
    try {
      const idParamsSchema = z.object({
        id: string().uuid(),
      });

      const { id } = idParamsSchema.parse(request.params);

      const data = request.body as Meal;

      await knex("meal")
        .where({
          id,
        })
        .update(data);
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error updating record" });
    }
  });

  app.delete("/:id", async (request, reply) => {
    try {
      const idParamsSchema = z.object({
        id: string().uuid(),
      });

      const { id } = idParamsSchema.parse(request.params);

      await knex("meal").where({ id }).delete();
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error updating record" });
    }
  });
}
