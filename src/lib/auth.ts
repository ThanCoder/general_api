import type { User } from "@prisma/client";
import type { Context, Hono } from "hono";
import { verify } from "hono/jwt";
import type { BlankEnv, BlankInput, BlankSchema } from "hono/types";

export async function getJwtUser(
  c: Context<BlankEnv, "/", BlankInput>
): Promise<User | string> {
  const header = c.req.header("Authorization");
  if (!header) return `token not found!`;

  const user = await verify(header, process.env.JWT_SECRET_KEY ?? "");
  if (!user) return `user not found!`;
  return user as User;
}

export async function routesProtected(
  app: Hono<BlankEnv, BlankSchema, "/">,
  routePath: string
) {
  app.use(routePath, async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("token ")) {
      return c.text("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await verify(token, process.env.JWT_SECRET_KEY ?? "");
      c.set("jwtPayload", payload);
      await next();
    } catch (e) {
      return c.text("Invalid token", 401);
    }
  });
}
