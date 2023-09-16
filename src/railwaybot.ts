require("dotenv").config();

import { Channel, TextChannel, Client, EmbedBuilder, createComponent } from "discord.js";
import { request, gql, GraphQLClient } from 'graphql-request';
const token = process.env.DISCORDTOKEN;

const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
var cron = require('node-cron');

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
    if (process.env.TEAMID === "" || process.env.TEAMID === undefined) {
        GetUsage();
    }
    else {
        GetUsageTeam();
    }
    console.log(`RailwayBot is online, logged in as ${client.user.username}#${client.user.discriminator} with id ${client.user.id}`);
});

const graphQLClient = new GraphQLClient('https://backboard.railway.app/graphql/v2', {
    headers: {
        "Authorization": `Bearer ${process.env.RAILWAYAPIKEY}`
    },
});
const query = gql`
query me {
    usage(measurements: [CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB])
    {
      value
      measurement
      tags
      {
        projectId
      }
    }
    estimatedUsage(measurements: [CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB])
    {
      estimatedValue
      measurement
      projectId
    }
    me {
      projects {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`;
const teamQuery = gql`
query me {
    usage(measurements: [CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB])
    {
      value
      measurement
      tags
      {
        projectId
      }
    }
    estimatedUsage(measurements: [CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB])
    {
      estimatedValue
      measurement
      projectId
    }
    team(id: "${process.env.TEAMID}") {
      projects {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`;

//Cron-job for usage alerts
cron.schedule('0 * * * *', async () => {
    if (process.env.TEAMID === "" || process.env.TEAMID === undefined) {
        GetUsage();
    }
    else {
        GetUsageTeam();
    }
});
async function GetUsage() {
    const results = await graphQLClient.request(query) as GraphQLResponse;
    let projects: Project[] = [];
    for (let i = 0; i < results.me.projects.edges.length; i++) {
        if (results.usage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.tags.projectId === results.me.projects.edges[i].node.id).length != 0 && results.usage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.tags.projectId === results.me.projects.edges[i].node.id).length != 0 && results.usage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.tags.projectId === results.me.projects.edges[i].node.id).length != 0) {
            var project: Project = {
                name: results.me.projects.edges[i].node.name,
                id: results.me.projects.edges[i].node.id,
                CpuUsage: results.usage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.tags.projectId === results.me.projects.edges[i].node.id)[0].value,
                MemUsage: results.usage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.tags.projectId === results.me.projects.edges[i].node.id)[0].value,
                Egress: results.usage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.tags.projectId === results.me.projects.edges[i].node.id)[0].value,
                EstimatedCpuUsage: results.estimatedUsage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.projectId === results.me.projects.edges[i].node.id)[0].estimatedValue,
                EstimatedMemUsage: results.estimatedUsage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.projectId === results.me.projects.edges[i].node.id)[0].estimatedValue,
                EstimatedEgress: results.estimatedUsage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.projectId === results.me.projects.edges[i].node.id)[0].estimatedValue,
            };
            projects.push(project);
        }
    }
    const usageChannel = await client.channels.fetch(`${process.env.USAGECHANNEL}`) as TextChannel
    usageChannel.send({ content: "**USAGE REPORT**" })
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Usage Metrics",
            })
            .setTitle(project.name)
            .setDescription(`**TOTAL COST**: $${(project.CpuUsage * 0.000463 + project.MemUsage * 0.000231 + project.Egress * 0.1).toFixed(4)}\n**TOTAL ESTIMATED COST**: $${(project.EstimatedCpuUsage * 0.000463 + project.EstimatedMemUsage * 0.000231 + project.EstimatedEgress * 0.1).toFixed(4)}\nBreakdown below:`)
            .addFields(
                {
                    name: "CPU Usage",
                    value: `${project.CpuUsage.toFixed(4)}vCores\n($${(project.CpuUsage * 0.000463).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Memory Usage",
                    value: `${project.MemUsage.toFixed(4)}GB\n($${(project.MemUsage * 0.000231).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Egress",
                    value: `${project.Egress.toFixed(4)}GB\n($${(project.Egress * 0.1).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated CPU Usage",
                    value: `${project.EstimatedCpuUsage.toFixed(4)}vCores\n($${(project.EstimatedCpuUsage * 0.000463).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated Memory Usage",
                    value: `${project.EstimatedMemUsage.toFixed(4)}GB\n($${(project.EstimatedMemUsage * 0.000231).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated Egress",
                    value: `${project.EstimatedEgress.toFixed(4)}GB\n($${(project.EstimatedEgress * 0.1).toFixed(4)})`,
                    inline: true
                },
            )
            .setColor("#00b0f4")
            .setFooter({
                text: "Railway Usage Metrics",
                iconURL: "https://devicons.railway.app/i/railway-dark.svg",
            })
            .setTimestamp();
        usageChannel.send({ embeds: [embed] })
    }
}
async function GetUsageTeam() {
    const results = await graphQLClient.request(teamQuery) as GraphQLResponseTeam;
    let projects: Project[] = [];
    for (let i = 0; i < results.team.projects.edges.length; i++) {
        if (results.usage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.tags.projectId === results.team.projects.edges[i].node.id).length != 0 && results.usage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.tags.projectId === results.team.projects.edges[i].node.id).length != 0 && results.usage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.tags.projectId === results.team.projects.edges[i].node.id).length != 0) {
            var project: Project = {
                name: results.team.projects.edges[i].node.name,
                id: results.team.projects.edges[i].node.id,
                CpuUsage: results.usage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.tags.projectId === results.team.projects.edges[i].node.id)[0].value,
                MemUsage: results.usage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.tags.projectId === results.team.projects.edges[i].node.id)[0].value,
                Egress: results.usage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.tags.projectId === results.team.projects.edges[i].node.id)[0].value,
                EstimatedCpuUsage: results.estimatedUsage.filter(usage => usage.measurement === 'CPU_USAGE' && usage.projectId === results.team.projects.edges[i].node.id)[0].estimatedValue,
                EstimatedMemUsage: results.estimatedUsage.filter(usage => usage.measurement === 'MEMORY_USAGE_GB' && usage.projectId === results.team.projects.edges[i].node.id)[0].estimatedValue,
                EstimatedEgress: results.estimatedUsage.filter(usage => usage.measurement === 'NETWORK_TX_GB' && usage.projectId === results.team.projects.edges[i].node.id)[0].estimatedValue,
            };
            projects.push(project);
        }
    }
    const usageChannel = await client.channels.fetch(`${process.env.USAGECHANNEL}`) as TextChannel
    usageChannel.send({ content: "**USAGE REPORT**" })
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Usage Metrics",
            })
            .setTitle(project.name)
            .setDescription(`**TOTAL COST**: $${(project.CpuUsage * 0.000463 + project.MemUsage * 0.000231 + project.Egress * 0.1).toFixed(4)}\n**TOTAL ESTIMATED COST**: $${(project.EstimatedCpuUsage * 0.000463 + project.EstimatedMemUsage * 0.000231 + project.EstimatedEgress * 0.1).toFixed(4)}\nBreakdown below:`)
            .addFields(
                {
                    name: "CPU Usage",
                    value: `${project.CpuUsage.toFixed(4)}vCores\n($${(project.CpuUsage * 0.000463).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Memory Usage",
                    value: `${project.MemUsage.toFixed(4)}GB\n($${(project.MemUsage * 0.000231).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Egress",
                    value: `${project.Egress.toFixed(4)}GB\n($${(project.Egress * 0.1).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated CPU Usage",
                    value: `${project.EstimatedCpuUsage.toFixed(4)}vCores\n($${(project.EstimatedCpuUsage * 0.000463).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated Memory Usage",
                    value: `${project.EstimatedMemUsage.toFixed(4)}GB\n($${(project.EstimatedMemUsage * 0.000231).toFixed(4)})`,
                    inline: true
                },
                {
                    name: "Estimated Egress",
                    value: `${project.EstimatedEgress.toFixed(4)}GB\n($${(project.EstimatedEgress * 0.1).toFixed(4)})`,
                    inline: true
                },
            )
            .setColor("#00b0f4")
            .setFooter({
                text: "Railway Usage Metrics",
                iconURL: "https://devicons.railway.app/i/railway-dark.svg",
            })
            .setTimestamp();
        usageChannel.send({ embeds: [embed] })
    }
}
//Webhook Setup
app.post('/railway', (req: any, res: any) => {
    processWebhook(req.body);
    console.log(req.body);
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
    let embed: EmbedBuilder;
    if (status != "CRASHED") {
        embed = new EmbedBuilder()
            .setAuthor({
                name: "Deployment info:",
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
    }
    else {
        embed = new EmbedBuilder()
            .setAuthor({
                name: "Deployment Crashed:",
            })
            .setTitle(projectName)
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
            .setColor("#ff0000")
            .setFooter({
                text: "RailwayBot",
                iconURL: "https://devicons.railway.app/i/railway-light.svg",
            })
            .setTimestamp();
    }
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
//Usage type
interface Project {
    name: string;
    id: string;
    CpuUsage: number;
    MemUsage: number;
    Egress: number;
    EstimatedCpuUsage: number;
    EstimatedMemUsage: number;
    EstimatedEgress: number;
}
//API response type
interface GraphQLResponse {
    usage: Usage[]
    estimatedUsage: EstimatedUsage[]
    me: Me
}
interface GraphQLResponseTeam {
    usage: Usage[]
    estimatedUsage: EstimatedUsage[]
    team: Team
}

interface Team {
    projects: Projects
}

interface Usage {
    value: number
    measurement: string
    tags: Tags
}

interface Tags {
    projectId: string
}

interface EstimatedUsage {
    estimatedValue: number
    measurement: string
    projectId: string
}

interface Me {
    projects: Projects
}

interface Projects {
    edges: Edge[]
}

interface Edge {
    node: Node
}

interface Node {
    id: string
    name: string
}

// General error handling
process.on("uncaughtException", function (err) {
    console.log(`Fatal error occured:`);
    console.error(err);
    if (client !== undefined) {
        logError(err);
    }
});

async function logError(err: any) {
    const logChannel = await client.channels.fetch(`${process.env.LOGCHANNEL}`) as TextChannel
    logChannel.send({ content: `**Fatal error experienced:** ${err}` });
}