import fastify from "fastify";
import { env } from "./env";
import cookie from '@fastify/cookie'
import { usersRoute } from "./routes/users";

const app = fastify();

app.register(cookie)

app.register(usersRoute, {
  prefix: "user",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP SERVER RUNNING");
  });
