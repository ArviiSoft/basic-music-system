const { SlashCommandBuilder } = require('discord.js');
const emojiler = require('./Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sıra')
        .setDescription('Şarkı sırasını gösterir.'),
    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || queue.tracks.toArray().length === 0) {
            return interaction.reply({ content: `${emojiler.dikkat} **Sırada şarkı yok.**`, flags: 64 });
        }

        const current = queue.currentTrack;
        const upcoming = queue.tracks.toArray().slice(0, 10).map((track, index) => 
            `${index + 1}. [${track.title}](${track.url}) • ${track.author}`
        ).join('\n');

        return interaction.reply({
            content: `${emojiler.muzikdiski} **Şu an çalan şarkı** \n- **[${current.title}](${current.url})** \n\n**Kuyruk** \n${upcoming || 'Yok'}`,
        });
    },
};