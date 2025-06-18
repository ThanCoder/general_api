import { serve } from "@hono/node-server";
import { Hono } from "hono";
import novelRoute from "./routes/novel.js";
import userRoute from "./routes/user.js";
import adminRoute from './routes/admin_user.js'

import dotenv from "dotenv";

dotenv.config();

const app = new Hono();


app.get("/", (c) => {
  return c.html(<h1>WellCome My ThanCoder Api</h1>);
});

app.route("/novel", novelRoute);
app.route("/user", userRoute);
app.route("/user/admin", adminRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
