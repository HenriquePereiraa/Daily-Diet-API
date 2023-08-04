import { FastifyInstance } from "fastify";

export async function logoutRoute(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    reply.cookie("sessionId", "", { expires: new Date(0) });
  });
}
