module.exports = async(client,emoji) => {
    if(!emoji.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
    const log = await emoji.guild.fetchAuditLogs({limit:1,type:'EMOJI'});
    const executor = log.entries.first().executor;
    if(!log) return;
    let channel = emoji.guild.channels.find(v => v.name.toLowerCase() === 'dev-chat' || v.name.toLowerCase() === 'general' || v.name.toLowerCase() === "steve");
    if(!channel || !channel.permissionsFor(executor).has("SEND_MESSAGES")) {
        console.log("Channel not found, or no permission.")
        const channels = emoji.guild.channels.filter(v => {
            return v.permissionsFor(executor).has("SEND_MESSAGES")
        })
        if(channels.size > 0) {
            channel = channels.random();
        }

    }
    if(!channel) return console.warn("no channel found")
    channel.send(`${executor.toString()} hey cunt why did you add that emoji?`);
}