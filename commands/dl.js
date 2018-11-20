const ytdl = require('ytdl-core');
const fs = require('fs-extra')
exports.run = async(client,msg,args) => {
    try {
        if(msg.author.id === "303027173659246594") return msg.channel.send(':no_entry: You do not have permission');
        if(args.length < 2) return msg.channel.send('NO ARGS, NO GAYS');
        const result = ytdl(args[0], { filter: 'audioonly'})
        if(!result) return msg.channel.send('No results found')
        let m = await msg.channel.send(`Downloading <${args[0]}> as **${args[1]}.mp3**`);
        m.delete();
        result.pipe(fs.createWriteStream(`./db/sounds/${args[1]}.mp3`));
        return result.on('end', () => {
            m.edit('Downloaded video to **' + args[1] + ".mp3**");
        });

    }catch(ex) {
        return msg.channel.send('Error; ' + ex.message)
    }
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'dl',
	aliases:[],
	description: 'downloads YT via yt-dl',
	usage:'dl <url> <name>'
};
 