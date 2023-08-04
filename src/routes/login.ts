import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function loginRoute(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    try {
      const dataUserBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      const { name, email } = dataUserBodySchema.parse(request.body);

      if (!name || !name.trim() || !email || !email.trim()) {
        reply.status(400).send();
        throw new Error("Null or missing the name or email!");
      }

      const user = await knex("users")
        .where({
          name,
          email,
        })
        .first();

      if (!user) {
        reply.status(400).send();
        throw new Error("User not found!");
      }

      const { session_id } = user;

      reply.cookie("sessionId", session_id, {
        path:"/",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })

      return reply.status(200).send(session_id)
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.error);
    }
  });
}
