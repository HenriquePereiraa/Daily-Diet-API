import fastify from "fastify";
import cookie from "@fastify/cookie";
import { usersRoute } from "./routes/users";
import { loginRoute } from "./routes/login";
import { logoutRoute } from "./routes/logout";
import { mealRoute } from "./routes/meal";

export const app = fastify();

app.register(cookie);

app.register(usersRoute, {
  prefix: "user",
});

app.register(loginRoute, {
  prefix: "login",
});

app.register(logoutRoute, {
  prefix: "logout",
});

app.register(mealRoute, {
  prefix: "meal",
});
