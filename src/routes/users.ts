import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export async function usersRoute(app: FastifyInstance) {
  app.get("/:sessionId", async (request, reply) => {
    try {
      const sessionIdRequestSchema = z.object({
        sessionId: z.string().uuid(),
      });

      const { sessionId } = sessionIdRequestSchema.parse(request.params);

      if (!sessionId) {
        reply.status(400).send();
        throw new Error("Null or missing the sessionId");
      }

      const user = await knex("users").where({
        session_id: sessionId,
      });

      return user;
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.post("/", async (request, reply) => {
    try {
      const createUserBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      const { name, email } = createUserBodySchema.parse(request.body);

      if (name === null || email === null) {
        throw new Error("Null or missing the name or email!");
      }

      const hasEmailInDatabase = await knex("users").where({
        email,
      });

      if (hasEmailInDatabase) {
        reply.status(400).send();
        throw new Error(
          "The email address entered is already associated with an existing account!"
        );
      }

      let sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      await knex("users").insert({
        id: randomUUID(),
        name,
        email,
        session_id: sessionId,
      });
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });
}
