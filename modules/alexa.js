const ytdl = require('ytdl-core');
const youtubeAPI = require('simple-youtube-api');
const youtube = new youtubeAPI(process.env.API_YOUTUBE);
const urlLib = require('url');
const https = require('https');


const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/queue.json');
const db = low(adapter);
db.defaults({queue:[]}).write();

const RESPONSES = {
    default:[
        "Sorry, I can't do that","Sorry, I do not understand",
        "Sorry I didn't get that",
        "I don't know what you mean, try again.",
        "I didn't quite get that.",
        "I didn't get that, please try again.",
        "I didn't get that, Please try another command"
    ],
    tell: [
        "Who?",
        "Who do you want to tell?",
        "Sorry, who?",
        "WHO!?!?"
    ]
}
const blacklisted = ["146240326728810496"]

module.exports = async(client,msg,args) => {
    if(blacklisted.includes(msg.author.id)) return;
    if(args.length == 0) return msg.channel.send(getResponse());
    switch(args[0].toLowerCase()) {
        case "q_add":
            let m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}**`);
            if(!msg.guild.voiceConnection) {
                if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                await msg.member.voiceChannel.join();
            }
            this.queue.add(msg,args,m)
            .then(r => msg.channel.send("Added?"))
            .catch(err => {
                console.error(`[zeko/q_add] ${err.stack}`)
                msg.channel.send("bnodjmfg")
            })
            break;
        case "yt":
        case "play":
            try {
                let m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}**`);
                let bytes = "0 Bytes"
                if(!msg.guild.voiceConnection) {
                    if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                    await msg.member.voiceChannel.join();
                }
                if(msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.author.id === "303027173659246594") return m.edit("🚫 Forbidden preston until current song is done")
                const results = await youtube.searchVideos(args.slice(1).join(" "),1);
                if(results.length === 0) return m.edit("Could not find any videos with that name.");
                let start = Date.now();
                m.edit(`Loading **${results[0].title}**...`)
                
                const video = await results[0].fetch();
                //if(video.duration.hours > 3) return m.edit("Sorry, No. Over 90minutes.")
                const conn = msg.guild.voiceConnection;
                const stream = ytdl(results[0].id,{ filter : 'audioonly' })
                stream.on("response",res => {
                    bytes = formatBytes(res.headers['content-length']);
                })
                const dispatcher = conn.playStream(stream);
                dispatcher.on("start",() => {
                    try {
                        let msTook = Date.now() - start;
                        msg.channel.send({embed:{
                            color:12857387,
                            footer:{text:`${bytes} | Fetched in ${(msTook/1000).toFixed(2)} seconds | Requested by ${msg.author.tag}`},
                            description:`Now playing **[${results[0].title}](https://youtu.be/${results[0].id})** by **${results[0].channel.title}** (${formatTime(video.duration)})`
                        }})
                        m.delete();
                    }catch(err) {
                        console.error('[zeko] ' + err.message)
                        m.edit(`Something happened when playing. ${err.message}`)
                    }
                })
                console.log(`[zeko] Playing "${results[0].title}", requested by ${msg.author.tag}`)
                

            }catch(err) {
                console.log('[zeko] ' + err.stack)
                msg.channel.send({embed:{
                    title:'Error Occurred while Playing',
                    color:12857387,
                    description: `${err.message}`
                }});
            }
            break;
        case "vol":
        case "volume": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            if(!args[1]) return msg.channel.send("Playing at **" + ((msg.guild.voiceConnection.dispatcher.volume*100).toFixed(2)) + "%**");
            let input = parseInt(args[1]);
            if(input == NaN || input <= 0 || input > 150) {
                return msg.channel.send("Sorry, volume must be a number between 1 and 100");
            }else{
                msg.guild.voiceConnection.dispatcher.setVolume((input / 100))
                msg.react("👍").catch(() => {});
            }
            break;
        } case "kick":
            if(args[1] === "preston" || args[1] === "autism" || args[1] === "prestone" || args[1] === "prestoné") {
                let user = msg.guild.members.get("303027173659246594");
                if(!user) return msg.channel.send("Preston is not in this server. This is not sad, don't play despacito");
                try {
                    let invites = await msg.guild.fetchInvites();
                    if(invites.size == 0) {
                        invites = await msg.guild.channels.first().createInvite({maxage:0});
                    }else {
                        invites = invites.first();
                    }
                    await user.send("Alexa Play Despacito. " + invites.url);
                    await user.kick("play despacito")
                    msg.channel.send("Kicked Preston! Now Playing Despacito");
                    try {
                        let connection = msg.guild.voiceConnection||(msg.member.voiceChannel) ? await msg.member.voiceChannel.join() : null;
                        if(connection) {
                            connection.playFile('./db/sounds/despacito.mp3')
                        }
                    }catch(err) {
                        console.log('[zeko] KickFail: ' + err.message)
                    }
                }catch(err) {
                    console.log('[zeko] ' + err.message)
                    msg.channel.send("Could not kick preston. This is so sad. Alexa Play despacito")
                }
                
            }else{
                return msg.channel.send("Sorry, you can't kick people besides preston. Try playing despacito");
            }
            break;
        case "louder": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            const vol = msg.guild.voiceConnection.dispatcher.volume;
            if(vol + .1 > 1.5) {
                return msg.channel.send("Sorry, can not increase volume any louder.")
            }
            msg.guild.voiceConnection.dispatcher.setVolume(vol + .1)
            msg.react("👍").catch(() => {});
            break;
        } case "quieter": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            const vol = msg.guild.voiceConnection.dispatcher.volume;
            if(vol - .05 <= 0) {
                return msg.channel.send("Sorry, can not decrease volume any quieter.")
            }
            msg.guild.voiceConnection.dispatcher.setVolume(vol - .05)
            msg.react("👍").catch(() => {});
            break;
        } case "quiet": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            msg.guild.voiceConnection.dispatcher.setVolume(.25)
            break;
        } case "stop":
        case "skip":
        if(msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.author.id === "303027173659246594") return msg.channel.send("🚫 Forbidden preston")
            if(msg.guild.voiceConnection) {
                if(msg.guild.voiceConnection.dispatcher) {
                    msg.guild.voiceConnection.dispatcher.end();
                    msg.react("👍").catch(() => {});
                }else{
                    return msg.channel.send("Cannot skip, am not playing anything");
                }
            }else{
                return msg.channel.send("Cannot skip, I'm not in a channel.")
            }
            break;
        case "tell":
            const query = args[1].toLowerCase();
            let user = await client.users.find(v => v.username.toLowerCase() === query || v.id === query || v.username.toLowerCase().startsWith(query) || query.startsWith(v.username.toLowerCase()));
            if(!user) return msg.channel.send(getResponse("tell"))
            user.send(`${msg.author.tag} told me to tell you: \`\`\`${args.slice(2).join(" ")}\`\`\``)
            .then(r => msg.react("👍").catch(() => {}))
            .catch(err => {
                console.log('[zeko] ' + err.message)
                msg.channel.send("Sorry, I could not send your message.")
            });
            break;
        case "8ball":
            const answers = [ "As I see it, yes", "It is certain", "It is decidedly so", "Most likely", "Outlook good", "Signs point to yes", "Without a doubt", "Yes", "Yes - definitely", "You may rely on it", "Reply hazy, try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again","Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
            msg.channel.send(`${answers[Math.floor(Math.random()*answers.length)]}`);
            break;
        case "help":
            msg.reply("l");
            break;
        case "kill":
            if(args[1] === "yourself") {
                if(msg.author.id === "117024299788926978") {
                    return process.exit();
                }
            }
            msg.channel.send(getResponse());
            break;
        case "flip":
        case "toss":
            if(args.slice(1).join(" ") === "a coin") {
                if(Math.random() > .5) {
                    msg.channel.send("It was heads!");
                }else{
                    msg.channel.send("It was tails!")
                }
                break;
            }
        default:
           msg.channel.send(getResponse());
    }
}
const queue = {
    add: function(msg,args,m) {
        return new Promise(async(resolve,reject) => {
            const q = queue.get();
            const results = await youtube.searchVideos(args.slice(1).join(" "),1);
            if(results.length == 0) return m.edit("Could not find any videos with that name.");
            const video = await results[0].fetch();
            db.get("queue").push({
                id: video.id,
                author: msg.id,
                tag: msg.author.tag,
                channel: msg.channel.id
            }).write()
            console.log("request",q.length)
            if(q.length === 1) { //should only hav eone video
                startPlaying(m,msg,video,msg.author.tag)
                m.edit(`Loading **${results[0].title}**...`)
            }else{
                m.edit(`Adding **${results[0].title}** to queue...`)
            }
            resolve(video);
        })

    },
    get: function() {
        return db.get("queue").value();
    }
}
exports.queue = queue;

function startPlaying(m,msg,video,author) {
    console.log('got: ', video.id)
    if(!video.id) throw "SFDUJFSM<DFSF "
    const conn = msg.guild.voiceConnection;
    const stream = ytdl(video.id,{ filter : 'audioonly' })
    const dispatcher = conn.playStream(stream);
    dispatcher.on("start",() => {
        msg.channel.send({embed:{
            color:12857387,
            description:`Now playing **[${video.title}](https://youtu.be/${video.id})** by **${video.channel.title}** (${formatTime(video.duration)})`,
            footer:{text:`Queued by ${author}`}
        }})
        m.delete();
    })
    dispatcher.on("end",(reason) => {
        db.get("queue").remove({id:video.id}).write();
        console.log(reason)
        const q = queue.get();
        if(q.length > 0) {
            console.log("queue end",q[0])
            startPlaying(m,msg,q[0].id,q[0].tag)
        }else if(q.length === 0) {
            if(conn.channel.members.filter(v => !v.bot).size === 0) {
                conn.disconnect();
            }
            //queue ended
        }
    })
    dispatcher.on("error",err => {
        console.log(`[zeko] Voice: ${err.message}`)
    })
    console.log(`[zeko] Playing "${video.title}", requested by ${author}`)
}


function getResponse(name = "default") {
    return RESPONSES[name][Math.floor(Math.random()*RESPONSES[name].length)];
}
function formatTime(duration) {
    const sec = `${duration.seconds.toString().padStart(2,0)}`;
    if(!duration.minutes) {
        return sec;
    }
    if(duration.hours) {
        return `${duration.hours}:${duration.minutes.toString().padStart(2,0)}:${sec}`
    }else{
        return `${duration.minutes}:${sec}`;
    }
}
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}