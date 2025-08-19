module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: "❌ Komut çalıştırılırken hata oluştu."
                });
            } else {
                await interaction.reply({
                    content: "❌ Komut çalıştırılırken hata oluştu.",
                    ephemeral: true
                });
            }
        }
    }
};