import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExist } from "../middlewares/check-session-id-exist";
import { checkId } from "../utils/check-id";

interface Meal {
  id: string;
  name: string;
  description: string;
  created_at: string;
  in_diet: boolean;
  user_meal_id: string;
}

export async function mealRoute(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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
    }
  );

  app.get(
    "/",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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
    }
  );

  app.get("/:id", async (request, reply) => {
    try {
      const id = await checkId(request, reply);

      const meal = await knex("meal").where({
        id,
      });

      return reply.status(201).send(meal);
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.get(
    "/amount-meals",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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
    }
  );

  app.get(
    "/in-diet",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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
          })
          .count("id", { as: "count" })
          .first();

        return reply.status(200).send(amountMealsInDiet);
      } catch (error: any) {
        console.error(error.message);
        reply.status(500).send({ message: "Error when counting" });
      }
    }
  );

  app.get(
    "/out-diet",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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
          })
          .count("id", { as: "count" })
          .first();

        return reply.status(200).send(amountMealsInDiet);
      } catch (error: any) {
        console.error(error.message);
        reply.status(500).send({ message: "Error when counting" });
      }
    }
  );

  app.get(
    "/sequence-diet",
    { preHandler: [checkSessionIdExist] },
    async (request, reply) => {
      try {
        const { sessionId } = request.cookies;

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

        const bestSequence = meals.reduce(
          (result, currentValue) => {
            if (currentValue.in_diet) {
              result.currentSequence++;
              result.maxSequence = Math.max(
                result.currentSequence,
                result.maxSequence
              );
            } else {
              result.currentSequence = 0;
            }

            return result;
          },
          { currentSequence: 0, maxSequence: 0 }
        );

        const bestSequenceInDiet = bestSequence.maxSequence;

        reply.status(201).send(bestSequenceInDiet);
      } catch (error: any) {
        console.error(error.message);
        throw new Error(error.error);
      }
    }
  );

  app.put("/:id", async (request, reply) => {
    try {
      const id = await checkId(request, reply);

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
      const id = await checkId(request, reply);

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
      const id = await checkId(request, reply);

      await knex("meal").where({ id }).delete();
    } catch (error: any) {
      console.error(error.message);
      reply.status(500).send({ message: "Error updating record" });
    }
  });
}
