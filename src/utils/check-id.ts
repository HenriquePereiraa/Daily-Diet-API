import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function checkId(request: FastifyRequest, reply: FastifyReply) {
  try {
    const idParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = idParamsSchema.parse(request.params);

    return id
  } catch (error: any) {
    reply.status(400).send({ error: "Unauthorized" });
    throw new Error(error.error);
  }
}
