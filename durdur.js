const { SlashCommandBuilder } = require('discord.js');
const emojiler = require('./Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('durdur')
        .setDescription('Çalan şarkıyı duraklatır.'),
    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || !queue.node.isPlaying()) {
            return interaction.reply({ content: `${emojiler.dikkat} **Şu anda her hangi bir şarkı çalmıyor.**`, flags: 64 });
        }

        await queue.node.setPaused(true);
        return interaction.reply(`${emojiler.tik} Şarkı **duraklatıldı.**`);
    },
};