import * as valibot from "valibot";

import * as serviceRepository from "./service/repository.ts";

const serviceInputSchema = valibot.object({
  name: valibot.string(),
  healthcheckUrl: valibot.string(),
});

async function checkServiceHealthStatus(service: serviceRepository.Service) {
  const response = await fetch(service.healthcheckUrl);
  if (!response.ok) {
    return console.warn("Check service health status", service);
  }
  return console.log("Healthcheck complete", { service });
}

Deno.serve(async (request) => {
  const { method, url } = request;
  if (method !== "POST" || new URL(url).pathname !== "/") {
    return new Response("Not Found", { status: 400 });
  }
  if (!request.body) {
    return new Response("Bad Request", { status: 400 });
  }
  const body = await request.json();
  const { success, output } = valibot.safeParse(serviceInputSchema, body);
  if (!success) {
    return new Response("Bad Request", { status: 400 });
  }
  const secret = request.headers.get("x-heart-beat-secret");
  if (!secret || secret !== String(Deno.env.get("HEART_BEAT_SECRET"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const addedService = await serviceRepository.addService(output);
  return new Response(
    JSON.stringify({ message: "service added", addedService }),
    {
      status: 201,
      headers: {
        "content-type": "application/json",
      },
    },
  );
});

Deno.cron(
  "Check services health status",
  { minute: { every: 5 } },
  async () => {
    console.log("Running check heartbeat cron job...");
    const services = await serviceRepository.getServices();
    const requests = services.map(checkServiceHealthStatus);
    await Promise.all(requests);
    console.log("Finished cron job execution");
  },
);
