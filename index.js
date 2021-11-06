import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
import { Telegram } from 'telegraf';
import cors from 'cors';
// import fetch from 'node-fetch';
const port = process.env.PORT || 3000;
const app = express(); // create express server

var allowlist = ['https://eighties.vercel.app'];
var corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

// global context for sending msg by request from app
const telegram = new Telegram(process.env.TOKEN, {
    agent: null,
    webhookReply: true,
});

const bot = new Telegraf(process.env.TOKEN); // create Telegram bot
bot.startPolling(); // start poll updates

// use middleware (setting headers)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next(); // go to the next middleware
});

app.get('/', (req, res) => {
    res.send('Hello, I am CRM bot!');
});

app.use(express.json()); // parse incoming data

// handle post query from ecommerce app
app.post('/send-message', cors(corsOptionsDelegate), (req, res) => {
    try {
        const data = req.body; // minimize code
        console.log(data);
        // create msg string with order data
        let orderMsg = '📬 NEW ORDER:\n';
        orderMsg += 'Phone number: ' + data.phoneNumber + '\n';
        orderMsg += 'Shipping:\n';
        orderMsg += 'customer: ' + data.shipping.firstName + ' ' + data.shipping.lastName + '\n';
        orderMsg += 'address: ' + data.shipping.address + '\n';
        orderMsg += 'postal code: ' + data.shipping.postalCode + '\n';
        orderMsg += 'Items:\n';
        data.items.map(
            (_item) =>
                (orderMsg += `Name: ${_item.item}\nSKU: ${_item.sku}\nQTY: ${_item.qtyForSale}\n`)
        );
        orderMsg += 'Total: ' + data.total + data.currency;
        // send msg (new order info) to Admin
        telegram.sendMessage(process.env.ADMIN_TG_ID, orderMsg);
        return res.status(200).json({ msg: 'Order sended to manager!' });
    } catch (error) {
        return res.status(400).json({ error: 'Something wrong...' });
    }
});

// start express server
app.listen(port, () => console.log(`Bot started on port ${port}.`));
