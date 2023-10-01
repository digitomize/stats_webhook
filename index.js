const { EmbedBuilder, WebhookClient } = require('discord.js');
require('dotenv').config();

const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });

async function editor() {
    const message = await webhookClient.fetchMessage('1158139607171477655');
    const embed = new EmbedBuilder()
        .setTitle('IDKK')
        .setColor('#00FFFF')
        .setFooter({ text: 'Last updated' })
        .setTimestamp(); // Automatically adds a timestamp for "Last updated"

    webhookClient.editMessage('1158139607171477655', {
        content: 'Webhook test2222',
        // username: 'Digitomize | Stats',
        // avatarURL: 'https://res.cloudinary.com/dsazw0r59/image/upload/v1693023476/logo_bg_y5ixum.jpg',
        embeds: [embed],
    });
}

// Call editor() initially
editor();

// Set up setInterval to call editor() every 1 hour (3600 seconds)
setInterval(editor, 3600 * 1000); // 3600 seconds = 1 hour



// const message = await webhookClient.fetchMessage('1158139068970967070');

// const embed = new EmbedBuilder()
// 	.setTitle('Test')
// 	.setColor(0x00FFFF);

// webhookClient.send({
// 	content: 'Webhook test',
// 	username: 'Digitomize | Stats',
// 	avatarURL: 'https://res.cloudinary.com/dsazw0r59/image/upload/v1693023476/logo_bg_y5ixum.jpg',
// 	embeds: [embed],
// });