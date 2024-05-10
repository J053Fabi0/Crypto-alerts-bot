import { load } from "std/dotenv/mod.ts";

const env = await load();

export const BOT_TOKEN = env.BOT_TOKEN;
export const ADMIN_ID: number = +env.ADMIN_ID;
export const TOKEN_ID = env.TOKEN_ID;
export const API_KEY = env.API_KEY;
export const EVERY = +env.EVERY;
