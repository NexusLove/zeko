exports.run = async(client,msg,args) => {
    try {
        const m = await msg.channel.send('**⌛ Processing **');
        const result = {
            online:[],
            idle:[],
            dnd:[],
            offline:[],
            games:[]
        }

        await msg.guild.members.forEach(v => {
            result[v.presence.status].push(v)
            if(v.game) result.games.push(v)
        })

        m.edit(`**${result.online.length}** Online\n**${result.idle.length}** Idle\n**${result.dnd.length}** Do Not Disturb\n**${result.offline.length}** Offline\n**${result.games.length}** Playing Games`)
    }catch(err) {
        msg.channel.send('⚠ **Something Happened** \n' + err.message)
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'status',
	aliases:['online'],
	description: 'View amount of people online',
	usage:''
};
 