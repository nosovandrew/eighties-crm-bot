import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
// import fetch from 'node-fetch';
const port = process.env.PORT || 3000;
const app = express(); // create express server

// Telegram bot settings
const config = {
	telegram: { 
        agent: null,
        webhookReply: true,
    }
};

const bot = new Telegraf(process.env.TOKEN, config); // create Telegram bot

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
app.post('/', (req, res) => {
    try {
        // send msg (new order info) to Admin
        bot.use((ctx) => {
            ctx.telegram.sendMessage(
                process.env.ADMIN_TG_ID,
                `New order received!\n
                Contact number: ${req.body.phoneNumber}\n\n
                Shipping:\n
                ${req.body.firstName} ${req.body.lastName}\n
                address: ${req.body.address}\n
                postalCode: ${req.body.postalCode}\n\n
                Items:\n ${req.body.items.map((_item) => {
                    return `${_item.item}\n${_item.sku}\n${_item.qtyForSale}\n\n`;
                })}
                Total: ${req.body.total} ${req.body.currency}`
            );
        });
        return res.status(200).json({ msg: 'Order sended to admin!' });
    } catch (error) {
        return res.status(400).json({ error: 'Something wrong...' });
    }
});

bot.startPolling(); // start poll updates

// start express server
app.listen(port, () => console.log(`Bot started on port ${port}.`));
