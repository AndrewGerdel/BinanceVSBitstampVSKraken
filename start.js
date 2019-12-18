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

var DoIt = (async (currencyPair, bitstampCurrencyPair, krakenCurrencyPair) => {
    var binanceResults = await binanceClient.book({ symbol: currencyPair, limit: 5 });
    var binanceAskPrice = binanceResults.asks[0].price
    var binanceBidPrice = binanceResults.bids[0].price
    console.log(binanceAskPrice, binanceBidPrice);

    var bitstampResults = await bitstamp.orderBook(bitstampCurrencyPair);
    var bitstampAskPrice = parseFloat(bitstampResults.body.asks[0][0]).toFixed(4);
    var bitstampBidPrice = parseFloat(bitstampResults.body.bids[0][0]).toFixed(4);
    console.log(bitstampAskPrice, bitstampBidPrice);

    var krakenResults = await kraken.api('Ticker', { pair: krakenCurrencyPair });
    var krakenBidPrice = parseFloat(krakenResults.result[krakenCurrencyPair].b[0]).toFixed(4);
    var krakenAskPrice = parseFloat(krakenResults.result[krakenCurrencyPair].a[0]).toFixed(4);
    console.log(krakenAskPrice, krakenBidPrice);
});

 DoIt('BTCUSD', CURRENCY.BTC_USD, 'XXBTZUSD').then(async(res, rej) => {
    await DoIt('ETHUSD', CURRENCY.ETH_USD, 'XETHZUSD');
    await DoIt('XRPUSD', CURRENCY.XRP_USD, 'XXRPZUSD');
    await DoIt('LTCUSD', CURRENCY.LTC_USD, 'XLTCZUSD');
 });

// DoIt('XRPUSD', CURRENCY.XRP_USD, 'XXRPZUSD').then((res, rej) => {
//     DoIt('BTCUSD', CURRENCY.BTC_USD, 'XRPXBT');

// })