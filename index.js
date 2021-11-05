import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
// import fetch from 'node-fetch';
const port = process.env.PORT || 3000;
const app = express(); // create express server

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
app.post('/', (req, res) => {
    // send msg (new order info) to Admin
    bot.use((ctx) => {
        ctx.telegram.sendMessage(
            process.env.ADMIN_TG_ID,
            `New order received!
            Contact number: ${req.body.phoneNumber}`
        );
    });
});

// start express server
app.listen(port, () => console.log(`Bot started on port ${port}.`));
