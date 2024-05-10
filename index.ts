import "./crons.ts";
import db from "./db.ts";
import getPrice from "./getPrice.ts";
import { escapeHtml } from "escapeHtml";
import { ADMIN_ID, BOT_TOKEN } from "./env.ts";
import { Bot, GrammyError, HttpError } from "grammy";
import AlertType, { alertTypeToText } from "./alertType.ts";

export const bot = new Bot(BOT_TOKEN);

bot.on("message", (ctx, next) => {
  if (ctx.from.id === ADMIN_ID) return next();
});

bot.command("set", async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;

  const currentPrice = await getPrice();
  const howToUse = () =>
    ctx.reply(`How to use: <code>/set</code> ${escapeHtml("<price>")}`, { parse_mode: "HTML" });

  const price = +text.split(" ")[1];

  if (isNaN(price)) return howToUse();
  const type = price > currentPrice ? AlertType.gte : AlertType.lte;

  if (price === currentPrice) return ctx.reply("Price is already at that value!");

  await db.alertPrice.deleteMany();
  await db.alertPrice.add(price);

  await db.alertType.deleteMany();
  await db.alertType.add(type);

  ctx.reply(
    `Alert when price is ${escapeHtml(alertTypeToText(type))} <code>$${price}</code>.\n\n` +
      `Current price: <code>$${currentPrice}</code>.`,
    { parse_mode: "HTML" }
  );
});

bot.command("price", async (ctx) => {
  await ctx.reply(`Price: <code>$${await getPrice()}</code>`, { parse_mode: "HTML" });
});

bot.command("alert", async (ctx) => {
  const alertPrice = await db.alertPrice.getOne();
  const alertType = await db.alertType.getOne();

  if (!alertPrice || !alertType) return ctx.reply("No alert set!");

  return ctx.reply(
    `Alert when price is ${escapeHtml(alertTypeToText(alertType.value))} <code>$${alertPrice.value}</code>`,
    { parse_mode: "HTML" }
  );
});

bot.catch(async (err) => {
  await bot.api.sendMessage(ADMIN_ID, `Error`).catch(() => {});

  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) console.error("Error in request:", e.description);
  else if (e instanceof HttpError) console.error("Could not contact Telegram:", e);
  else console.error("Unknown error:", e);
});

bot.start({
  onStart: async () => {
    console.log("Bot started!");

    await bot.api.setMyCommands([
      { command: "set", description: "Set an alert" },
      { command: "alert", description: "Get the current alert" },
      { command: "price", description: "Get the current price" },
    ]);
  },
});
