import { fetchTickerData } from './fetch.js';
import { upsertTickerData } from './upsert.js';

async function updateAllTickers(database) {
  console.log('Starting update for all tickers');
  try {
    const query = "SELECT symbol FROM tickers WHERE symbol != 'ZVZZT'";
    console.log('Fetching symbols with query:', query);

    const { results } = await database.prepare(query).all();
    console.log('Fetched symbols:', results);

    for (const { symbol } of results) {
      console.log(`Updating data for symbol: ${symbol}`);
      const tickerData = await fetchTickerData(symbol);
      if (tickerData) {
        await upsertTickerData(symbol, tickerData, database);
      } else {
        console.log(`No new data for symbol: ${symbol}`);
      }
    }

    console.log('Update completed!');
  } catch (error) {
    console.error('Error during update:', error);
  }
}

export default {
  async fetch(request, env) {
    console.log("Received request for fetch");
    return new Response('Hello, world!');
  },

  async scheduled(event, env, ctx) {
    console.log("Cron job triggered");
    try {
      await updateAllTickers(env.DATABASE);
      return new Response('Update completed!');
    } catch (error) {
      console.error('Error during update:', error);
      return new Response('Error during update', { status: 500 });
    }
  },
};