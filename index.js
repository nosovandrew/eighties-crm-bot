import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
import { Telegram } from 'telegraf';
// import fetch from 'node-fetch';
const port = process.env.PORT || 3000;
const app = express(); // create express server

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
app.post('/send-message', (req, res) => {
    try {
        // send msg (new order info) to Admin
        telegram.sendMessage(
            process.env.ADMIN_TG_ID,
            `New order received!\n
            *Contact number*: ${req.body.phoneNumber}\n
            Shipping:\n
            ${req.body.firstName} ${req.body.lastName}\n
            address: ${req.body.address}\n
            postalCode: ${req.body.postalCode}\n\n
            Items:\n ${req.body.items.map(
                (_item) =>
                    `Name: ${_item.item}\nSKU: ${_item.sku}\nQTY: ${_item.qtyForSale}\n`
            )}
            Total: ${req.body.total} ${req.body.currency}`
        );
        return res.status(200).json({ msg: 'Order sended to admin!' });
    } catch (error) {
        return res.status(400).json({ error: 'Something wrong...' });
    }
});

// start express server
app.listen(port, () => console.log(`Bot started on port ${port}.`));
