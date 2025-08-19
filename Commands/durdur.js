const { SlashCommandBuilder } = require('discord.js');
const emojiler = require('../Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('durdur')
        .setDescription('Çalan şarkıyı duraklatır.'),
    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue || !queue.node.isPlaying()) {
            return interaction.reply({ 
                content: `${emojiler.dikkat} **Şu anda herhangi bir şarkı çalmıyor.**`, 
                flags: 64 
            });
        }
        
        if (queue.metadata?.userId && interaction.user.id !== queue.metadata.userId) {
            return interaction.reply({
                content: `${emojiler.dikkat} **Bu komutu sadece müziği başlatan kişi kullanabilir.**`,
                ephemeral: true
            });
        }

        await queue.node.setPaused(true);
        return interaction.reply(`${emojiler.tik} Şarkı **duraklatıldı.**`);
    },
};