import checkAlert from "./checkAlert.ts";

Deno.cron("check", { minute: { every: 3 } }, checkAlert);
