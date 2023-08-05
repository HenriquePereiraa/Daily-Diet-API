import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

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

      const meal = await knex("meal").where({
        user_meal_id: user.id,
      });

      return reply.status(201).send(meal);

    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });
}
