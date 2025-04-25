import { fetchTickerData } from './fetch.js';

async function upsertTickerData(symbol, tickerData, database) {
    console.log(`Upserting data for symbol: ${symbol}`);
    try {
        const query = `
INSERT INTO tickers (symbol, ex_dividend_date, declaration_date, record_date, payment_date, amount)
VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol) DO UPDATE SET
        ex_dividend_date = excluded.ex_dividend_date,
        declaration_date = excluded.declaration_date,
        record_date = excluded.record_date,
        payment_date = excluded.payment_date,
        amount = excluded.amount,
        updated_at = CURRENT_TIMESTAMP;
`;

        const values = [
            symbol,
            tickerData.ex_dividend_date ?? null,
            tickerData.declaration_date ?? null,
            tickerData.record_date ?? null,
            tickerData.payment_date ?? null,
            tickerData.amount != null ? parseFloat(tickerData.amount) : null
        ];

        if (values[5] !== null && isNaN(values[5])) {
             console.warn(`Parsed amount resulted in NaN for ${symbol}. Setting amount to NULL.`);
             values[5] = null;
        }

        const stmt = database.prepare(query);
        await stmt.bind(...values).run();
        console.log(`Successfully updated data for ${symbol}`);
    } catch (error) {
        console.error(`Error upserting data for ${symbol}:`, error);
        console.error(`Values causing error for ${symbol}:`, values);
        throw error;
    }
}

async function updateAllTickers(database) {
    console.log('Starting update for all tickers');
    try {
        const query = "SELECT symbol FROM tickers";
        console.log('Fetching symbols with query:', query);

        const { results } = await database.prepare(query).all();
        console.log('Fetched symbols:', results);

        for (const { symbol } of results) {
            console.log(`Updating data for symbol: ${symbol}`);
            const tickerData = await fetchTickerData(symbol);
            if (tickerData !== null) {
                await upsertTickerData(symbol, tickerData, database);
            } else {
                console.log(`Skipping update for symbol: ${symbol} due to fetch error or missing data.`);
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
        return new Response(null, { status: 204 });
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
