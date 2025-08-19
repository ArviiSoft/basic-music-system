const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { Client, GatewayIntentBits } = require('discord.js');
const emojiler = require('../Settings/emojiler.json');

module.exports = async (client) => {
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        },
    });

    await player.extractors.loadMulti(DefaultExtractors); 

    client.player = player;

    player.events.on('error', (queue, error) => {
        console.error(`[HATA] Şarkı oynatma Hatası: ${error.message}`);
    });

    player.events.on('connectionError', (queue, error) => {
        console.error(`[BAĞLANTI HATASI]: ${error.message}`);
    });

    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel.send(`${emojiler.muzikdiski} **Şu an çalan şarkı** \n- [${track.title}](${track.url}) \n  - **YÜKLEYEN:** ${track.author}`);
    });

    player.events.on('queueEnd', (queue) => {
        queue.metadata.channel.send(`${emojiler.tik} Kuyruk **sona erdi.**`);
    });

    return player;
};
