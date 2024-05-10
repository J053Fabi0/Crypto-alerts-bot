import getAlert from "./getAlert.ts";

Deno.cron("check", { minute: { every: 5 } }, getAlert);
