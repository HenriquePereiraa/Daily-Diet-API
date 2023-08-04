import fastify from "fastify";
import { env } from "./env";
import cookie from "@fastify/cookie";
import { usersRoute } from "./routes/users";
import { loginRoute } from "./routes/login";

const app = fastify();

app.register(cookie);

app.register(usersRoute, {
  prefix: "user",
});

app.register(loginRoute, {
  prefix: "login", 
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP SERVER RUNNING");
  });
