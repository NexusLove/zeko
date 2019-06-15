const fs = require('fs-extra');
exports.run = async(client,msg,args,flag) => {
    if(msg.author.id === "303027173659246594") return msg.channel.send(':no_entry: You do not have permission');
    if(!args[0]) return msg.channel.send(':middle_finger:');
    let connection = msg.guild.voiceConnection;
    if(!connection && msg.member.voiceChannel) connection = await msg.member.voiceChannel.join();
    if(!connection) return msg.channel.send('I am not and you are not in a voice channel. Therefore you are super ultra gay:tm:');
    if(args[0] === "servers" || args[0] === "guilds") {
        return msg.channel.send(`**I will broadcast / I am in these servers:**\n\`` + client.voiceConnections.map(v => v.channel.guild.name).join("`\n`") + "`");
    }else if(args[0] === "songs" || args[0] === "sounds") {
        const files = await fs.readdir("./db/sounds");
        return msg.author.send("Files: ```" + files.join("\n") + "```")
    }
    args[0] = (args[0].split(".").length > 1) ? args[0] : args[0] + ".mp3";
    if(!fs.existsSync(`./db/sounds/${args[0]}`)) {
        return msg.channel.send(`**${args[0]}** does not exist`);
    }
    let bitrate = flag.bitrate||flag.quality||8;
    let volume = flag.volume||flag.vol;
    volume = (volume) ? (volume/100) : 1;
    console.log(flag)
    let skip = flag.skip||flag.seek;
    let broadcast = (flag.broadcast)?true:false;
   
    if(broadcast) {
        const broadcast = client.createVoiceBroadcast();
        broadcast.playFile(`./db/sounds/${args[0]}`,{volume,seek:skip,bitrate})
        for (const connection of client.voiceConnections.values()) {
            connection.playBroadcast(broadcast);
        }
        return msg.channel.send(`Broadcasting **${args[0]}** at ${bitrate*1000}kbps,volume @ ${volume}, seeking to ${skip||0}`);
    }
    msg.channel.send(`Playing **${args[0]}** at ${bitrate*1000}kbps,volume @ ${volume}, seeking to ${skip||0}`);
    msg.guild.voiceConnection.playFile(`./db/sounds/${args[0]}`,{volume,seek:skip,bitrate})
}

exports.config = {
	enabled: true,
	usageIfNotSet: false,
	permissions:0,
    group:'fun',
    flags:{
        bitrate: 'number',
        volume: 'number',
        skip: 'number'
    }
};

exports.help = {
	name: 'quality9000',
	aliases:['q9'],
	description: 'dont',
	usage:'<filename w/o .ext> [flags]'
};
 