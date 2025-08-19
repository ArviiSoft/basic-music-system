const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function muzikButonlari() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setLabel('⏸️ Durdur')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('music_resume')
            .setLabel('▶️ Devam Ettir')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setLabel('⏭️ Şarkıyı Geç')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setLabel('⏹️ Bitir')
            .setStyle(ButtonStyle.Danger)
    );

    return [row];
}

async function handleButtons(interaction) {
    if (!interaction.isButton()) return;

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (queue?.metadata?.userId && interaction.user.id !== queue.metadata.userId) {
        return interaction.reply({
            content: "⚠️ **Bu butonu sadece komutu kullanan kişi kullanabilir.**",
            ephemeral: true
        });
    }

    switch (interaction.customId) {
        case "music_pause":
            if (!queue || !queue.node.isPlaying()) {
                return interaction.reply({ 
                    content: "⚠️ **Şu anda herhangi bir şarkı çalmıyor.**", 
                    ephemeral: true 
                });
            }
            queue.node.setPaused(true);
            await interaction.reply("⏸️ Şarkı **duraklatıldı.**");
            break;

        case "music_resume":
            if (!queue) {
                return interaction.reply({ 
                    content: "⚠️ **Kuyruk bulunamadı.**", 
                    ephemeral: true 
                });
            }
            queue.node.setPaused(false);
            await interaction.reply("▶️ Şarkı devam ediyor.");
            break;

        case "music_skip":
            if (!queue || !queue.node.isPlaying()) {
                return interaction.reply({ 
                    content: "⚠️ **Çalınan şarkı yok.**", 
                    ephemeral: true 
                });
            }
            await queue.node.skip();
            await interaction.reply("⏭️ Şarkı **geçildi.**");
            break;

        case "music_stop":
            if (!queue) {
                return interaction.reply({ 
                    content: "⚠️ **Kuyruk zaten boş.**", 
                    ephemeral: true 
                });
            }
            await queue.delete();
            await interaction.reply("⏹️ Müzik **durduruldu** ve kuyruk **temizlendi.**");
            break;

        default:
            await interaction.reply({ 
                content: "❓ **Bilinmeyen buton.**", 
                ephemeral: true 
            });
    }
}

module.exports = { muzikButonlari, handleButtons };