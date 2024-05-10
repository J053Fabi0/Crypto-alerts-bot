import { EVERY } from "./env.ts";
import checkAlert from "./checkAlert.ts";

Deno.cron("check", { minute: { every: EVERY } }, checkAlert);
