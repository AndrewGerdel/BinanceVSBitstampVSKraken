const config = require('./config.json');
const Binance = require('binance-api-node').default;
const { TickerStream, OrderBookStream, Bitstamp, CURRENCY } = require("node-bitstamp");

const KrakenClient = require('kraken-api');
const kraken = new KrakenClient();//key, secret);

process.on('unhandledRejection', ((error) => {
    console.log(new Date(), 'Unhandled Rejection: ', error);
}));

var binanceClient = Binance({
    apiKey: config.binanceApiKey,
    apiSecret: config.binanceApiSecret
});

var key = config.bitstampApiKey;
var secret = config.bitstampApiSecret;
var clientId = config.bitstampClientId;
const bitstamp = new Bitstamp({
    key,
    secret,
    clientId,
    timeout: 5000,
    rateLimit: true //turned on by default
});

var DoIt = (async (currencyPair, bitstampCurrencyPair) => {
    var binanceResults = await binanceClient.book({ symbol: currencyPair, limit: 10 });
    console.log(binanceResults);
    var bitstampResults = await bitstamp.orderBook(bitstampCurrencyPair);
    console.log(bitstampResults);
    var krakenResults = await kraken.api('Ticker', { pair: 'XRPUSD' });
    console.log(krakenResults);


});

DoIt('XRPUSD', CURRENCY.XRP_USD);