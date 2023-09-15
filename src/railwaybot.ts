require("dotenv").config();

import { Client } from "discord.js";
const token = process.env.DISCORDTOKEN;

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

console.log("Bot is starting...");

const client = new Client({
    intents: []
});

client.on("ready", async () => {
    if (!client.user || !client.application) {
        return;
    }

    console.log(`RailwayBot is online, logged in as ${client.user.username}#${client.user.discriminator} with id ${client.user.id}`);
});

app.post('/railway', (req: any, res: any) => {
    console.log('Received webhook:', req.body);
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Webhook server is active on port ${PORT}`);
});

client.login(token);