const ytdl = require('ytdl-core');
const fs = require('fs-extra')
exports.run = async(client,msg,args) => {
    try {
        if(msg.author.id === "303027173659246594") return msg.channel.send(':no_entry: You do not have permission');
        if(args.length < 2) return msg.channel.send('NO ARGS, NO GAYS');
        const result = ytdl(args[0], { filter: 'audioonly'})
        if(!result) return msg.channel.send('No results found')
        args[1] = args[1].replace(".mp3","");
        let m = await msg.channel.send({embed:{
            description:`Downloading <${args[0]}> as **${args[1]}.mp3**`,
        }});
        let lastPercent = 0;
        result.on("progress",(length,downloaded,total) => {
            let percent = (downloaded/total*100)
            let roundPercent = Math.round(percent/5)*5;
            if(roundPercent != lastPercent) {
                m.edit({embed:{
                    description:`Downloading to **${args[1]}.mp3**\n**From: **<${args[0]}>`,
                    footer:{text:`${formatBytes(downloaded)}/${formatBytes(total)} (${roundPercent}%) Downloaded `}
                }})
            }
            lastPercent = roundPercent;
        })
        result.pipe(fs.createWriteStream(`./db/sounds/${args[1]}.mp3`));
        return result.on('end', () => {
            m.edit(`Downloaded complete`);
        });

    }catch(ex) {
        return msg.channel.send('Error; ' + ex.message)
    }
};
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'dl',
	aliases:['download'],
	description: 'downloads YT via yt-dl',
	usage:'dl <url> <name>'
};
 