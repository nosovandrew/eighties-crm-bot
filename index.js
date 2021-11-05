import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
// import fetch from 'node-fetch';
const port = process.env.PORT || 3000;
const app = express(); // create express server

const bot = new Telegraf(process.env.TOKEN); // create Telegram bot

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

app.use(express.json());

app.post('/', (req, res) => {
    bot.use((ctx) => {
        ctx.telegram.sendMessage(
            process.env.ADMIN_TG_ID,
            `Msg: ${req.body.text}`
        );
    });
});

bot.startPolling(); // run Telegram bot

app.listen(port, () => console.log(`Bot started on port ${port}.`));
