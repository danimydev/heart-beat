import { Hono } from "@hono/hono";
import * as valibot from "valibot";
import * as serviceRepository from "./service/repository.ts";
import healthcheck from "./cron-job/healthcheck.ts";
import config from "./config.ts";

const app = new Hono();

app.use(async (c, next) => {
  const secret = c.req.header("x-heart-beat-secret");
  if (secret !== config.HEART_BEAT_SECRET) {
    return c.text("Unauthorized", 401);
  }
  await next();
});

app.get("/services", async (c) => {
  const services = await serviceRepository.list();
  return c.json(services, 200);
});

app.post("/services", async (c) => {
  const body = await c.req.json();
  const { success, output } = valibot.safeParse(
    valibot.object({
      name: valibot.string(),
      healthcheckUrl: valibot.string(),
    }),
    body,
  );
  if (!success) {
    return c.text("Bad request", 400);
  }
  const service = await serviceRepository.add(output);
  return c.json({ message: "Service added", service }, 201);
});

app.delete("/services", async (c) => {
  const services = await serviceRepository.list();
  const deleteServicePromises = services.map((s) =>
    serviceRepository.remove(s.id)
  );
  await Promise.all(deleteServicePromises);
  return c.text("OK", 200);
});

Deno.serve(app.fetch);

Deno.cron("healthcheck", "*/5 * * * *", healthcheck);
