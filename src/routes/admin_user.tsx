import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { UserTypes } from "../types/user_types.js";
import { sign, verify } from "hono/jwt";
import { getJwtUser } from "../lib/auth.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const user = await getJwtUser(c);
    if (typeof user === "string") {
      throw user;
    }

    //check admin
    if (user.type !== UserTypes.admin) throw `Your Not Admin User!`;
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return c.json({ result: users });
  } catch (error) {
    return c.json({ result: `${error}` }, 400);
  }
});

app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username) throw `'username' filed not found!`;
    if (!password) throw `'password' filed not found!`;

    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) throw `username not found`;

    //check password
    if (user.password !== password) throw `password not match!`;

    //check admin
    if (user.type !== UserTypes.admin) throw `Your Not Admin User!`;

    //gen token
    const token = await sign(user, process.env.JWT_SECRET_KEY ?? "");

    return c.json({ result: "success", token, user: user });
  } catch (error) {
    return c.json({ result: `${error}` }, 400);
  }
});

app.post("/signup", async (c) => {
  try {
    const { name, username, email, password } = await c.req.json();
    if (!name) throw `'name' filed not found!`;
    if (!username) throw `'username' filed not found!`;
    if (!email) throw `'email' filed not found!`;
    if (!password) throw `'password' filed not found!`;

    const findAdmin = await prisma.user.findFirst({
      where: { type: UserTypes.admin },
    });
    if (findAdmin) throw `Admin User Only One Created`;

    const findUser = await prisma.user.findFirst({ where: { username } });
    if (findUser) throw `username already exists`;

    const findEmailUser = await prisma.user.findFirst({ where: { email } });
    if (findEmailUser) throw `email already exists`;

    // မရှိရင်
    const user = await prisma.user.create({
      data: { name, username, email, password, type: UserTypes.admin },
    });

    return c.json({ result: "success", user: user });
  } catch (error) {
    return c.json({ result: `${error}` }, 400);
  }
});

export default app;
