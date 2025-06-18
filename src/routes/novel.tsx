import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getJwtUser } from "../lib/auth.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const novels = await prisma.novel.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json({ result: novels });
  } catch (err) {
    return c.json({ error: "server error" }, 500);
  }
});

// new novel
app.post("/", async (c) => {
  try {
    const {
      title,
      userId,
      coverUrl = "",
      author = "Unknown",
      translator = "Unknown",
      mc = "Unknown",
      isAdult = false,
      isCompleted = false,
    }: {
      title: string;
      userId: string;
      coverUrl?: string;
      author?: string;
      translator?: string;
      mc?: string;
      isAdult?: boolean;
      isCompleted?: boolean;
    } = await c.req.json();

    if (!title) {
      return c.json({ error: "title not found!" }, 500);
    }
    if (!userId) {
      return c.json({ error: "userId not found!" }, 500);
    }

    // check token
    const user = await getJwtUser(c);
    if (typeof user === "string") {
      throw user;
    }
    const foundNovel = await prisma.novel.findFirst({
      where: { title: title },
    });
    if (foundNovel) {
      return c.json({ result: "title already exists" }, 403);
    }
    // user ရှိရင်
    const novel = await prisma.novel.create({
      data: {
        title,
        userId,
        coverUrl,
        author,
        translator,
        mc,
        isAdult,
        isCompleted,
      },
    });

    return c.json({ result: "created", novel: novel });
  } catch (error) {
    return c.json({ result: `${error}` }, 500);
  }
});

export default app;
