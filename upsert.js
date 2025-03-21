export async function upsertTickerData(symbol, tickerData, database) {
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
      tickerData.ex_dividend_date,
      tickerData.declaration_date,
      tickerData.record_date,
      tickerData.payment_date,
      parseFloat(tickerData.amount)
    ];

    const stmt = database.prepare(query);
    await stmt.bind(...values).run();
    console.log(`Successfully updated data for ${symbol}`);
  } catch (error) {
    console.error(`Error upserting data for ${symbol}:`, error);
    throw error;
  }
}