import { kvdex, collection, model } from "kvdex";

export const kv = await Deno.openKv();
const db = kvdex(kv, {
  alertPrice: collection(model<number>()),
  alertType: collection(model<"above" | "bellow">()),
});
export default db;
