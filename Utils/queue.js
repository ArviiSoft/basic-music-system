const queues = new Map();

module.exports = {
    getQueue: (guildId) => queues.get(guildId),
    setQueue: (guildId, queue) => queues.set(guildId, queue),
    deleteQueue: (guildId) => queues.delete(guildId),
    hasQueue: (guildId) => queues.has(guildId),
};