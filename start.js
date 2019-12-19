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

    var bitstampResults = await bitstamp.orderBook(bitstampCurrencyPair);
    var bitstampAskPrice = parseFloat(bitstampResults.body.asks[0][0]).toFixed(8);
    var bitstampBidPrice = parseFloat(bitstampResults.body.bids[0][0]).toFixed(8);

    var krakenResults = await kraken.api('Ticker', { pair: krakenCurrencyPair });
    var krakenBidPrice = parseFloat(krakenResults.result[krakenCurrencyPair].b[0]).toFixed(8);
    var krakenAskPrice = parseFloat(krakenResults.result[krakenCurrencyPair].a[0]).toFixed(8);

    var highestBid = binanceBidPrice;
    var highest = 'Binance';
    if (bitstampBidPrice > highestBid) {
        highestBid = bitstampBidPrice;
        highest = 'Bitstamp';
    }
    if (krakenBidPrice > highestBid) {
        highestBid = krakenBidPrice;
        highest = 'Kraken';
    }

    var lowestAsk = binanceAskPrice;
    var lowest = 'Binance';
    if (bitstampAskPrice < lowestAsk) {
        lowestAsk = bitstampAskPrice;
        lowest = 'Bitstamp';
    }
    if (krakenAskPrice < lowestAsk) {
        lowestAsk = krakenAskPrice;
        lowest = 'Kraken';
    }

    var diffPercent = ((highestBid - lowestAsk) / highestBid) * 100;
    if (diffPercent >= 0.6)
        console.log('%s: %s VS %s: Highest Bid: %s.  Lowest Ask: %s.  Difference: %s.  Diff Percentage: %s', currencyPair, highest, lowest, highestBid, lowestAsk, (highestBid - lowestAsk), diffPercent);


});


var CheckAll = (async () => {
    await DoIt('BTCUSD', CURRENCY.BTC_USD, 'XXBTZUSD');
    await DoIt('ETHUSD', CURRENCY.ETH_USD, 'XETHZUSD');
    await DoIt('XRPUSD', CURRENCY.XRP_USD, 'XXRPZUSD');
    await DoIt('XRPBTC', CURRENCY.XRP_BTC, 'XXRPXXBT');
    await DoIt('LTCUSD', CURRENCY.LTC_USD, 'XLTCZUSD');
});

CheckAll();
setInterval(() => {
    CheckAll();
}, 30000);
// DoIt('XRPUSD', CURRENCY.XRP_USD, 'XXRPZUSD').then((res, rej) => {
//     DoIt('BTCUSD', CURRENCY.BTC_USD, 'XRPXBT');

// })