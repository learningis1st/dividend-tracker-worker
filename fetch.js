export async function fetchTickerData(symbol) {
  console.log(`Fetching data for symbol: ${symbol}`);
  try {
    const response = await fetch(`https://finance.learningis1.st/quote?symbol=${symbol}`);

    if (!response.ok) {
      console.error(`Fetch failed for ${symbol}. Status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`Received data for ${symbol}:`, data);

    const tickerData = data[symbol]?.fundamental;
    if (!tickerData) {
      console.error(`No valid data found for ${symbol}`);
      return null;
    }

    const latestDividend = {
      ex_dividend_date: tickerData.divExDate,
      declaration_date: tickerData.declarationDate,
      record_date: tickerData.nextDivExDate,
      payment_date: tickerData.nextDivPayDate,
      amount: tickerData.divAmount
    };

    console.log(`Latest dividend for ${symbol}:`, latestDividend);
    return latestDividend;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}