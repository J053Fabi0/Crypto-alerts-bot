import getAlert from "./getAlert.ts";

Deno.cron("check", { minute: { every: 3 } }, getAlert);
