const record = require('../modules/record');
const BLACKLISTED = ['303027173659246594']
exports.run = async(client,msg,args) => {
    if(BLACKLISTED.includes(msg.author.id)) return msg.channel.send('⛔ You do not have permission');
    if(args.length === 0) {
        if(!msg.member.voiceChannel) return msg.channel.send('Join a channel or specify one');
        msg.member.voiceChannel.join()
        .catch(err => {
            return msg.channel.send(`Could not join that channel: ${err.message}`)
        })
        //.then(channel => record(channel))
        return;
    }
    if(args[0].toLowerCase() === "quit" || args[0].toLowerCase() === "leave") {
        if(!msg.guild.me.voiceChannel) return msg.channel.send("I'm not in a channel");
        return msg.guild.me.voiceChannel.leave()
    }else if(args[0] === "move") {
        if(msg.author.id !== '117024299788926978') return msg.channel.send('⛔ You do not have permission.');
        //if(!msg.member.voiceChannel) return msg.channel.send('Join a channel');
        let channel = msg.guild.channels.filter(v => v.type === 'voice').find(v => v.id === args[1] || v.name.toLowerCase() === args.slice(1).join(" ").toLowerCase());
        if(!channel) return msg.channel.send('Could not find that channel');
        msg.member.voiceChannel.members.forEach(v => {
            v.setVoiceChannel(channel);
        })
        return;
    }
    let channel = await msg.guild.channels.filter(v => v.type === 'voice').find(v => v.id === args[0] || v.name.toLowerCase() === args.join(" ").toLowerCase())
    if(!channel) return msg.channel.send("Couldn't find any channels");
    channel.join()
    .catch(err => {
        return msg.channel.send(`Could not join that channel: ${err.message}`)
    })
    //.then(channel => record(channel))
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'voice',
	aliases:[],
	description: 'join voice',
	usage:'voice [voice id]'
};
 