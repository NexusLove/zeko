const stats = require('../modules/stats.js').db;
exports.run = (client,msg,args) => {
    if(args[0]) {
        if(args[0].toLowerCase() === "optout" || args[0].toLowerCase() === "opt-out") {
            const optOut = stats.get("optout").value();
            const user = stats.get("users").get(msg.author.id).value();

            if(optOut.includes(msg.author.id)) return msg.channel.send("❌ You are already opt-out.");
        
            stats.get("optout").push(msg.author.id).write();
            stats.get("users").unset(msg.author.id).write();
            msg.channel.send("✅ Successfully opted out of stats collection")
            return;
        }
        let targetUser = args[0].toLowerCase();
        if(args[0].toLowerCase() === "me") targetUser = msg.author.id;
        const userStat = stats.get("users").get(targetUser).value();
        if(!userStat) {
            return msg.channel.send(`**${targetUser}** does not have any stats`);
        }else{
            const user = client.users.get(targetUser);
            console.log(targetUser,msg.author.id)
            if(targetUser === msg.author.id) {
                msg.channel.send({embed:{
                    title:`Stats for ${user.tag}`,
                    description:`**${userStat.msgs}** messages sent\n**${userStat.imgs}** images posted`,
                    footer:{text:`Opt out by sending '>stat optout'`}
                }})
            }else{
                msg.channel.send({embed:{
                    title:`Stats for ${user.tag}`,
                    description:`**${userStat.msgs}** messages sent\n**${userStat.imgs}** images posted`,
                }})
            }
            
        }
    }else{
        const stat = stats.get("global").value();
        msg.channel.send(`**${stat.msgs}** messages have been sent.\n**${stat.imgs}** images have been posted.\n\n_type \`>stats me\` to view your own stats_`)
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'stats',
	aliases:['stat'],
	description: 'View statistics recorded by the bot',
	usage:'stats [me/ID of user]'
};
 