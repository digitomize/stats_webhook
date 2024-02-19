const { EmbedBuilder, WebhookClient } = require('discord.js');
const https = require('https');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });

async function editAPIstatsMessage() {
    try {
        const apiStatus = await checkAPIStatus(); // Check API status

        const messageId = '1158381114499530832';

        const embed4 = new EmbedBuilder()
            .setTitle('API Status')
            .setColor(0x00FF00)
            .addFields([
                { name: 'Main API Status', value: apiStatus.mainAPIStatus },
                { name: 'V2 API Status', value: apiStatus.v2APIStatus },
            ])
            .setFooter({ text: 'Last updated' })
            .setTimestamp(); // Automatically adds a timestamp for "Last updated"
        await webhookClient.editMessage(messageId, {
            content: '',
            embeds: [embed4],
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function editGitHubStatsMessage() {
    try {
        const githubData = await fetchGitHubData(); // Fetch GitHub data


        // Find the message you want to edit (Replace '123456789012345678' with the actual message ID)
        const messageId = '1158139607171477655';

        const existingMessage = await webhookClient.fetchMessage(messageId);

        console.log("HEREEE:::::::::::::::::::::::::");
        const embed1 = new EmbedBuilder()
            .setTitle('Info')
            .setColor(0x00FF00)
            .addFields([
                { name: 'Total Contributors', value: githubData.contributors.toString(), inline: true },
                { name: 'Total Stars', value: githubData.stargazers_count.toString(), inline: true },
            ])
            .setFooter({ text: 'Last updated' })
            .setTimestamp(); // Automatically adds a timestamp for "Last updated"
        const embed2 = new EmbedBuilder()
            .setTitle('Issues')
            .setColor(0x00FF00)
            .addFields([
                { name: 'Total Issues', value: githubData.issues.total.toString(), inline: true },
                { name: 'Open Issues', value: githubData.issues.open.toString(), inline: true },
                { name: 'Closed Issues', value: githubData.issues.closed.toString(), inline: true },
            ])
            .setFooter({ text: 'Last updated' })
            .setTimestamp(); // Automatically adds a timestamp for "Last updated"
        const embed3 = new EmbedBuilder()
            .setTitle('Pull Requests')
            .setColor(0x00FF00)
            .addFields([
                { name: 'Total Pull Requests', value: githubData.pull_requests.total.toString(), inline: true },
                { name: 'Open Pull Requests', value: githubData.pull_requests.open.toString(), inline: true },
                { name: 'Closed Pull Requests', value: githubData.pull_requests.closed.toString(), inline: true },
            ])
            .setFooter({ text: 'Last updated' })
            .setTimestamp(); // Automatically adds a timestamp for "Last updated"


        await webhookClient.editMessage(messageId, {
            content: 'GitHub Stats', // Optional content update
            embeds: [embed1, embed2, embed3],
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call editGitHubStatsMessage() initially
editGitHubStatsMessage();
editAPIstatsMessage();

app.get('/fetch', async (req, res) => {
    try {
        await editGitHubStatsMessage();
        await editAPIstatsMessage();
        // await checkAPIStatus();
        res.status(200).send('GitHub stats update triggered.');
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Error updating GitHub stats.');
    }
});

app.get('/fetchAPI', async (req, res) => {
    try {
        
        await checkAPIStatus();
        res.status(200).send('GitHub stats update triggered.');
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Error updating GitHub stats.');
    }
});

async function fetchAPI() {
    await makeHTTPGetRequest('https://stats-digitomize-discord.onrender.com/fetch');
}


// Set up setInterval to edit the message with updated GitHub data every 1 hour (3600 seconds)
// setInterval(editGitHubStatsMessage, 3600 * 1000); // 3600 seconds = 1 hour
setInterval(fetchAPI, 600 * 1000); // 10min


async function checkAPIStatus() {
    try {
        const mainAPIStatus = await makeHTTPGetRequest('https://api.digitomize.com/contests');
        const v2APIStatus = await makeHTTPGetRequest('https://www.v2api.digitomize.com/contests');

        return { mainAPIStatus, v2APIStatus };
    } catch (error) {
        console.error('Error checking API status:', error);
        return { mainAPIStatus: 'Error', v2APIStatus: 'Error' };
    }
}

function makeHTTPGetRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(':green_circle: Working');
            } else {
                resolve(':red_circle: Not Working');
            }
        }).on('error', (error) => {
            console.error('Error making HTTP request:', error);
            resolve('Error');
        });
    });
}


// Function to fetch GitHub data
async function fetchGitHubData() {
    const repoOwner = 'digitomize'; // Replace with the GitHub owner
    const repoName = 'digitomize'; // Replace with the GitHub repository name

    const repositoryUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
    const issuesUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}`;
    const openIssuesUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+is:issue+is:open`;
    const closedIssuesUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+is:issue+is:closed`;
    const pullRequestsUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+is:pr`;
    const openPullRequestsUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+is:pr+is:open`;
    const closedPullRequestsUrl = `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+is:pr+is:closed`;
    const contributorsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`;

    const options = {
        headers: {
            'User-Agent': 'Your-User-Agent', // Replace with your GitHub username or application name
            // 'Authorization': `token ${process.env.GITHUB_ACCESS_TOKEN}`, // Replace with your GitHub access token
        },
    };

    const [repositoryResponse, issuesResponse, openIssuesResponse, closedIssuesResponse, pullRequestsResponse, openPullRequestsResponse, closedPullRequestsResponse, contributorsResponse] = await Promise.all([
        fetchJson(repositoryUrl, options),
        fetchJson(issuesUrl, options),
        fetchJson(openIssuesUrl, options),
        fetchJson(closedIssuesUrl, options),
        fetchJson(pullRequestsUrl, options),
        fetchJson(openPullRequestsUrl, options),
        fetchJson(closedPullRequestsUrl, options),
        fetchJson(contributorsUrl, options),
    ]);

    return {
        stargazers_count: repositoryResponse.stargazers_count,
        issues: {
            total: issuesResponse.total_count,
            open: openIssuesResponse.total_count,
            closed: closedIssuesResponse.total_count,
        },
        pull_requests: {
            total: pullRequestsResponse.total_count,
            open: openPullRequestsResponse.total_count,
            closed: closedPullRequestsResponse.total_count,
        },
        contributors: contributorsResponse.length
    };
}


// Function to fetch JSON data from a URL
async function fetchJson(url, options) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
