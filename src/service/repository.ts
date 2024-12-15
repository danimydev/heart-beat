import { NAMESPACE_DNS, v5 } from "@std/uuid";

const kv = await Deno.openKv();

const SERVICES_KEY = "services";

export type Service = {
  id: string;
  name: string;
  healthcheckUrl: string;
};

export async function list() {
  const servicesIterator = kv.list<Service>({ prefix: [SERVICES_KEY] });
  const services: Service[] = [];
  for await (const s of servicesIterator) {
    services.push(s.value);
  }
  return services;
}

export async function add(service: Omit<Service, "id">) {
  const data = new TextEncoder().encode(service.name);
  const uuid = await v5.generate(NAMESPACE_DNS, data);
  await kv.set([SERVICES_KEY, uuid], { id: uuid, ...service });
  const addedService: Service = {
    id: uuid,
    ...service,
  };
  return addedService;
}

export async function remove(id: string) {
  await kv.delete([SERVICES_KEY, id]);
}
