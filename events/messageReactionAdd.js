const stats = require('../modules/stats.js').db;
let violations = 0;
module.exports = (client,react,user) => {
    //if(react.message.author.id !== "303027173659246594") return;
    if(!react.message.guild) return;
    const guild = react.message.guild;
    if(!guild) return console.log("failed to grab guild");
    const member = guild.members.get(user.id)
    if(!member) return;
    //if(!member.roles.has("521740547837132820") && !member.roles.has('371123829155823627')) return;
    if(member.id === "117024299788926978") {
        if(react.emoji.name === "🇸") {
            for(let i=0;i<6;i++) {
                let content = react.message.content;
                if(content.length === 0) {
                    if(react.message.attachments.size == 0) return;
                    content = react.message.attachments.first().proxyURL;
                }
                react.message.channel.send(content);
            }
        }
    }
    if(react.message.channel.id === "291675586324070401") return;
    if(member.roles.has("521740547837132820")) {
        if(member.id !== client.user.id) return react.message.channel.send(`${user} You think you can do that? I don't think so.`);
        
        if(react.emoji.name === "❌") {
            console.log(`[contentreg] ${user.tag} removed post from ${react.message.author.tag}`);
    
            react.message.delete().catch(() => {});
            react.message.channel.send(`${react.message.author} Sorry but that is against The Tony Confederation regulations and has been removed. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
        }else if(react.emoji.name === "⚠") {
            console.log(`[contentreg] ${user.tag} warned ${react.message.author.tag}`);
    
            react.message.channel.send(`⚠ ${react.message.author} I'm sorry but that is currently against The Tony Confederation content regulations. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
        }
    }else if(member.roles.has('371123829155823627')) {
        if(react.emoji.name === "❌") {
            console.log(`[contentreg] ${user.tag} removed post from ${react.message.author.tag}`);
    
            react.message.delete().catch(() => {});
            react.message.channel.send(`${react.message.author} Sorry but that is against The Steve Empire's content regulations and has been removed. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
        }else if(react.emoji.name === "⚠") {
            console.log(`[contentreg] ${user.tag} warned ${react.message.author.tag}`);;
    
            react.message.channel.send(`⚠ ${react.message.author} I'm sorry but that is currently against The Steve Empire's content regulations. ` + (violations >= 3 ? 'Continuation of these violations will result in punishment.' : ''))
        }
    }
    const prevViolations = stats.get("users").has(react.message.author.id).has("violations").value();

    if(prevViolations) {
        stats.get("users").get(react.message.author.id).update("violations",v => v+=1).write();
    }else{
        stats.get("users").set(`${react.message.author.id}.violations`,1).write();
    }
    
    
}