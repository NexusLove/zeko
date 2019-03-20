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
            const stat_msg = [
                `**${userStat.msgs||0}** messages sent`,
                `**${userStat.imgs||0}** images posted`,
                `**${userStat.violations||0}** Content Violations committed`
            ]
            if(targetUser === msg.author.id) {
                msg.channel.send({embed:{
                    title:`Stats for ${user.tag}`,
                    description:stat_msg.join("\n"),
                    footer:{text:`Opt out by sending '>stat optout'`}
                }})
            }else{
                msg.channel.send({embed:{
                    title:`Stats for ${user.tag}`,
                    description:stat_msg.join("\n")
                }})
            }
            
        }
    }else{
        const all_stats = stats.get("users").value();
        console.log(all_stats)
        let totals = {imgs:0,msgs:0,violations:0};
        for(const key in all_stats) {
            if(all_stats[key].imgs) totals.imgs += all_stats[key].imgs;
            if(all_stats[key].msgs) totals.msgs += all_stats[key].msgs;
            if(all_stats[key].violations) totals.violations += all_stats[key].violations;
        }
        const final_list = [
            `**${totals.msgs}** messages have been sent.`,
            `**${totals.imgs}** images have been posted.`,
            `**${totals.violations}** violations have been committed`
        ]
        msg.channel.send(final_list.join("\n") + `\n\n_type \`>stats me\` to view your own stats_`)
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
 