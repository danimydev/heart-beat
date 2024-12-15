import * as serviceRepository from "../service/repository.ts";

export default async function () {
  console.log("Running check heartbeat cron job...");
  const services = await serviceRepository.list();
  const requests = services.map(async (s) => {
    const response = await fetch(s.healthcheckUrl);
    if (!response.ok) {
      return console.warn("Check service health status", s);
    }
    return console.log("Healthcheck complete", { s });
  });
  await Promise.all(requests);
  console.log("Finished cron job execution");
}
