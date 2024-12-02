const kv = await Deno.openKv();

const SERVICES_KEY = "services";

type Service = {
  name: string;
  healthcheckUrl: string;
};

async function checkServiceHealthStatus(service: Service) {
  const response = await fetch(service.healthcheckUrl);
  if (!response.ok) {
    return console.warn("Check service health status", service);
  }
  return console.log("Healthcheck complete", service);
}

Deno.cron(
  "Runs every 10 mins to check heartbeat",
  { minute: { every: 10 } },
  async () => {
    console.log("Running check heartbeat cron job...");
    const servicesIterator = kv.list<Service>({ prefix: [SERVICES_KEY] });
    const services: Service[] = [];
    for await (const s of servicesIterator) {
      services.push(s.value);
    }
    const requests = services.map(checkServiceHealthStatus);
    await Promise.all(requests);
    console.log("Finished cron job execution");
  },
);
