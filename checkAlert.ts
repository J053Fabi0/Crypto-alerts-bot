import db from "./db.ts";
import { Big } from "math";
import { bot } from "./index.ts";
import { ADMIN_ID } from "./env.ts";
import getPrice from "./getPrice.ts";
import AlertType from "./alertType.ts";
import { escapeHtml } from "escapeHtml";
import { alertTypeToText } from "./alertType.ts";

export default async function checkAlert(): Promise<void> {
  const alertType = await db.alertType.getOne();
  const alertPrice = await db.alertPrice.getOne();
  if (!alertPrice || !alertType) return;

  const price = Big(await getPrice());

  if (
    (alertType.value === AlertType.gte && price.lt(alertPrice.value)) ||
    (alertType.value === AlertType.lte && price.gt(alertPrice.value)) ||
    (alertType.value === AlertType.neq && price.eq(alertPrice.value))
  )
    return;

  const newAlert: AlertType.gte | AlertType.neq | AlertType.lte = (() => {
    switch (alertType.value) {
      case AlertType.gte: {
        // If price is exactly, the new alert will tell you when it's different
        if (price.eq(alertPrice.value)) return AlertType.neq;
        // it's greater
        return AlertType.lte;
      }

      case AlertType.lte: {
        // If price is exactly, the new alert will tell you when it's different
        if (price.eq(alertPrice.value)) return AlertType.neq;
        // it's lower
        return AlertType.gte;
      }

      case AlertType.neq:
        return price.gt(alertPrice.value) ? AlertType.lte : AlertType.gte;
    }
  })();
  await db.alertType.deleteMany();
  await db.alertType.add(newAlert);

  const alertText = price.eq(alertPrice.value)
    ? "exactly"
    : alertType.value === AlertType.gte
    ? "above"
    : "bellow";

  await bot.api.sendMessage(
    ADMIN_ID,
    `Price is ${alertText} <code>$${alertPrice.value}</code>!\n` +
      (alertText === "exactly" ? "" : `Current price: <code>$${price.toString()}</code>.\n`) +
      `\nNext alert will be when price is ${escapeHtml(alertTypeToText(newAlert))} ` +
      `<code>$${alertPrice.value}</code>.`,
    { parse_mode: "HTML" }
  );
}
