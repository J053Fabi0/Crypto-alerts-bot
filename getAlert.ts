import db from "./db.ts";
import { bot } from "./index.ts";
import { ADMIN_ID } from "./env.ts";
import getPrice from "./getPrice.ts";

export default async function getAlert(): Promise<void> {
  const alertPrice = await db.alertPrice.getOne();
  const alertType = await db.alertType.getOne();
  if (!alertPrice || !alertType) return;

  const price = await getPrice();

  if (
    (alertType.value === "above" && price < alertPrice.value) ||
    (alertType.value === "bellow" && price > alertPrice.value)
  )
    return;

  await bot.api.sendMessage(ADMIN_ID, `Price is ${alertType.value} $${alertPrice.value}!\nPrice: $${price}`);
  await db.alertType.deleteMany();
  await db.alertPrice.deleteMany();
}
