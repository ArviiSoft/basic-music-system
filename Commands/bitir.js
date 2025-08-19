const { SlashCommandBuilder } = require('discord.js');
const emojiler = require('../Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bitir')
        .setDescription('Şarkıyı bitirir ve kuyruğu temizler.'),
    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: `${emojiler.dikkat} **Bot şu anda ses kanalında değil.**`, flags: 64 });
        }

        if (queue.metadata?.userId && interaction.user.id !== queue.metadata.userId) {
            return interaction.reply({ 
                content: `${emojiler.dikkat} **Bu komutu sadece şarkıyı başlatan kişi kullanabilir.**`, 
                flags: 64
            });
        }

        queue.delete();
        return interaction.reply(`${emojiler.tik} Bağlantı **kesildi** ve kuyruk **temizlendi.**`);
    },
};