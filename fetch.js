export async function fetchTickerData(symbol) {
    console.log(`Fetching data for symbol: ${symbol}`);
    try {
        const response = await fetch(`https://finance.learningis1.st/quote?symbol=${symbol}&fields=fundamental`);

        if (!response.ok) {
            console.error(`Fetch failed for ${symbol}. Status: ${response.status}`);
            return null; // Return null if fetch fails
        }

        const data = await response.json();
        console.log(`Received data for ${symbol}:`, data);

        const tickerData = data[symbol]?.fundamental;
        if (!tickerData) {
            console.error(`No fundamental data found for ${symbol}`);
            return null; // Return null if fundamental data is missing
        }

        // If divAmount is missing, null, or 0, return object with null dates and 0 amount
        if (tickerData.divAmount == null || tickerData.divAmount === 0) {
            console.log(`No dividend amount (or amount is 0) found for ${symbol}. Returning null dates and amount 0.`);
            return {
                ex_dividend_date: null,
                declaration_date: null,
                record_date: null,
                payment_date: null,
                amount: 0
            };
        }

        // Otherwise, construct the dividend object
        const latestDividend = {
            ex_dividend_date: tickerData.divExDate ?? null,
            declaration_date: tickerData.declarationDate ?? null,
            record_date: tickerData.nextDivExDate ?? null,
            payment_date: tickerData.nextDivPayDate ?? null,
            amount: tickerData.divAmount
        };

        console.log(`Latest dividend for ${symbol}:`, latestDividend);
        return latestDividend;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null; // Return null on general error
    }
}
