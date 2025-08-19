const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ascii = require('ascii-table');

function loadCommands(client) {
    const table = new ascii().setHeading("🤖 KOMUTLAR", "🟡 DURUM");
    let commandsArray = [];

    const commandsPath = path.join(__dirname, '../Commands');
    const commandFiles = fs.readdirSync(commandsPath, { withFileTypes: true });

    for (const file of commandFiles) {
        if (file.isDirectory()) {
            const folderPath = path.join(commandsPath, file.name);
            const folderFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

            for (const f of folderFiles) {
                const commandFile = require(path.join(folderPath, f));
                if (commandFile.data instanceof SlashCommandBuilder) {
                    client.commands.set(commandFile.data.name, { folder: file.name, ...commandFile });
                    commandsArray.push(commandFile.data.toJSON());
                    table.addRow(`📂 ${f}`, "✔️ Yüklendi.");
                } else {
                    table.addRow(f, "✖️ Builder kullanılmamış.");
                }
            }
        } 
        else if (file.isFile() && file.name.endsWith('.js')) {
            const commandFile = require(path.join(commandsPath, file.name));
            if (commandFile.data instanceof SlashCommandBuilder) {
                client.commands.set(commandFile.data.name, { folder: 'Root', ...commandFile });
                commandsArray.push(commandFile.data.toJSON());
                table.addRow(`📄 ${file.name}`, "✔️ Yüklendi.");
            } else {
                table.addRow(file.name, "✖️ Builder kullanılmamış.");
            }
        }
    }

    client.application.commands.set(commandsArray);
    console.log(table.toString(), `\n✔️ [KOMUTLAR - ( ${commandsArray.length} )] yüklendi.`);
}

module.exports = { loadCommands };