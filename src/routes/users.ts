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

      if (!name || !name.trim() || !email || !email.trim()) {
        throw new Error("Null or missing the name or email!");
      }

      const hasEmailInDatabase = await knex("users")
        .where({
          email,
        })
        .first();

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

  app.put("/:id", async (request, reply) => {
    try {
      const userIdRequestSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = userIdRequestSchema.parse(request.params);

      const userId = await knex("users").where({
        id,
      });

      if (!userId) {
        reply.status(400).send();
      }

      const updateUserBodySchema = z.object({
        name: z.string(),
      });

      const { name } = updateUserBodySchema.parse(request.body);

      if (!name || !name.trim()) {
        reply.status(400).send();
        throw new Error("Null or missing the name and email!");
      }

      await knex("users").update({
        name,
      });
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });

  app.delete("/:id", async (request, reply) => {
    try {
      const userIdRequestSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = userIdRequestSchema.parse(request.params);

      const userId = await knex("users")
        .where({
          id,
        })
        .first();

      if (!userId) {
        reply.status(400).send({ error: "User not found" });
      }

      await knex.raw("PRAGMA foreign_keys = ON;");

      await knex("users").where({ id }).delete();
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });
}
