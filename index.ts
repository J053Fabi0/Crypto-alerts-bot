import "./crons.ts";
import db from "./db.ts";
import { Bot } from "grammy";
import { ADMIN_ID, BOT_TOKEN } from "./env.ts";
import getPrice from "./getPrice.ts";

export const bot = new Bot(BOT_TOKEN);

bot.on("message", (ctx, next) => {
  if (ctx.from.id === ADMIN_ID) return next();
});

bot.command("set", async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;

  const howToUse = () => ctx.reply("How to use: /set <above | bellow> <price>");

  const type = text.split(" ")[1];
  const price = +text.split(" ")[2];

  if (isNaN(price)) return howToUse();
  if (type !== "above" && type !== "bellow") return howToUse();

  await db.alertPrice.deleteMany();
  await db.alertPrice.add(price);

  await db.alertType.deleteMany();
  await db.alertType.add(type as "above" | "bellow");

  ctx.reply(`Alert set to ${type} $${price}!`);
});

bot.command("price", async (ctx) => {
  const price = await getPrice();
  await ctx.reply(`Price: $${price}`);
});

bot.start({
  onStart: async () => {
    console.log("Bot started!");

    await bot.api.setMyCommands([
      { command: "set", description: "Set an alert" },
      { command: "price", description: "Get the current price" },
    ]);
  },
});
