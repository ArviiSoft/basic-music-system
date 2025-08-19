module.exports = {
    name: "ready",
    once: true, 
    execute(client) {
        console.log(`[AKTİF] ${client.user.tag}`);

        client.user.setPresence({
            activities: [{ name: "ArviS (arviis.)", type: 2 }], 
            status: "online"
        });
    }
};