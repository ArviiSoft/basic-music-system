const { SlashCommandBuilder } = require('discord.js');
const emojiler = require('../Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devam-ettir')
        .setDescription('Duraklatılan şarkıyı devam ettirir.'),
    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || !queue.node.isPaused()) {
            return interaction.reply({ 
                content: `${emojiler.dikkat} **Şarkı zaten çalıyor veya duraklatılmamış.**`, 
                flags: 64 
            });
        }

        if (queue.metadata?.userId && interaction.user.id !== queue.metadata.userId) {
            return interaction.reply({
                content: `${emojiler.dikkat} **Bu komutu sadece şarkıyı başlatan kişi kullanabilir.**`,
                ephemeral: true
            });
        }

        await queue.node.setPaused(false);
        return interaction.reply(`${emojiler.tik} Şarkı **devam ettirildi.**`);
    },
};