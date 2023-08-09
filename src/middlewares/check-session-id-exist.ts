import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExist(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    reply.status(400).send({ error: "Unauthorized" });
    throw new Error("Unauthorized!");
  }
}
