import axiod from "axiod";
import { API_KEY, TOKEN_ID } from "./env.ts";

const url = new URL("https://api.coingecko.com/api/v3/simple/price");
url.searchParams.append("ids", TOKEN_ID);
url.searchParams.append("vs_currencies", "usd");
url.searchParams.append("x_cg_demo_api_key", API_KEY);

export default async function getPrice(): Promise<number> {
  const { data } = await axiod.get<{ [x: string]: { usd: number } }>(url.toString());

  return data[TOKEN_ID].usd;
}
