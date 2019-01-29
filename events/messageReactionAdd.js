let violations = 0;
module.exports = (client,react,user) => {
    //if(react.message.author.id !== "303027173659246594") return;
    if(!react.message.guild) return;
    const guild = react.message.guild;
    if(!guild) return console.log("failed to grab guild");
    const member = guild.members.get(user.id)
    if(!member) return;
    if(!member.roles.has('371123829155823627')) return;
    violations++;
    if(react.emoji.name === "❌") {
        react.message.delete().catch(() => {});
        react.message.channel.send(`${react.message.author} Sorry but that is against The Steve Empire's content regulations. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
    }else if(react.emoji.name === "⚠") {
        react.message.channel.send(`⚠ ${react.message.author} I'm sorry but that is currently against The Steve Empire's content regulations. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
    }
}