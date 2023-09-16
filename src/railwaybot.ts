require("dotenv").config();

import { Channel, TextChannel, Client, EmbedBuilder } from "discord.js";
import { stat } from "fs";
const token = process.env.DISCORDTOKEN;

const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    })
);

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
    processWebhook(req.body);
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Webhook server is active on port ${PORT}`);
});

client.login(token);

function processWebhook(body: WebhookBody) {
    if (body.type == "DEPLOY") {
        let projectName: string = body.project.name;
        let environmentName: string = body.environment.name;
        let serviceName: string = body.service.name;
        let deploymentCommit: string;
        let commitAuthor: string;
        if (body.deployment.meta.commitAuthor != undefined) {
            deploymentCommit = body.deployment.meta.commitMessage;
            commitAuthor = body.deployment.meta.commitAuthor;
        }
        else {
            deploymentCommit = "No commit.";
            commitAuthor = "No commit.";
        }
        let status: string = body.status;
        SendDeploymentMessage(projectName, environmentName, serviceName, deploymentCommit, commitAuthor, status);
    }
}

async function SendDeploymentMessage(projectName: string, environmentName: string, serviceName: string, deploymentCommit: string, deploymentCommitAuthor: string, status: string) {
    const channel = await client.channels.fetch(`${process.env.LOGCHANNEL}`) as TextChannel
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "New Deployment:",
        })
        .setTitle(projectName)
        .setDescription(`**${status}**`)
        .addFields(
            {
                name: "Enviroment",
                value: environmentName,
                inline: true
            },
            {
                name: "Service",
                value: serviceName,
                inline: true
            },
            {
                name: "Commit Author",
                value: deploymentCommitAuthor,
                inline: true
            },
            {
                name: "Commit Message",
                value: deploymentCommit,
                inline: false
            },
        )
        .setColor("#00ff40")
        .setFooter({
            text: "RailwayBot",
            iconURL: "https://devicons.railway.app/i/railway-light.svg",
        })
        .setTimestamp();
    channel.send({ embeds: [embed] })
}

//Webhook types set up
interface WebhookBody {
    type: string;
    environment: EnvironmentBody;
    project: ProjectBody;
    deployment: DeploymentBody;
    status: string;
    service: ServiceBody;
}
interface EnvironmentBody {
    id: string;
    name: string;
}
interface ProjectBody {
    id: string;
    name: string;
}
interface ServiceBody {
    id: string;
    name: string;
}
interface DeploymentBody {
    id: string;
    meta: DeploymentMeta;
}
interface DeploymentMeta {
    repo: string;
    branch: string;
    commitAuthor: string;
    commitMessage: string;
}