import { Hono } from "hono";
import { sign } from "hono/jwt";
import { routesProtected } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

const app = new Hono();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? ""; // Must be 256-bit for HS256

// Public route
app.get("/", (c) => c.text("Public Page"));

app.post("/signup", async (c) => {
  try {
    const { name, username, email, password } = await c.req.json();
    if (!name) throw `'name' filed not found!`;
    if (!username) throw `'username' filed not found!`;
    if (!email) throw `'email' filed not found!`;
    if (!password) throw `'password' filed not found!`;

    const findUser = await prisma.user.findFirst({ where: { username } });
    if (findUser) throw `username already exists`;

    const findEmailUser = await prisma.user.findFirst({ where: { email } });
    if (findEmailUser) throw `email already exists`;

    // မရှိရင်
    const user = await prisma.user.create({
      data: { name, username, email, password },
    });

    return c.json({ result: "success", user: user });
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


    //gen token
    const token = await sign(user, process.env.JWT_SECRET_KEY ?? "");

    return c.json({ result: "success", token, user: user });
  } catch (error) {
    return c.json({ result: `${error}` }, 400);
  }
});

export default app;
