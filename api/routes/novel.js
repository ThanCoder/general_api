import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
const app = new Hono();
app.get('/', async (c) => {
    try {
        const users = await prisma.user.findMany();
        return c.json(users);
    }
    catch (err) {
        console.error('Error:', err);
        return c.json({ error: 'server error' }, 500);
    }
});
export default app;
