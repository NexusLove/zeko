const ytdl = require('ytdl-core');
const youtubeAPI = require('simple-youtube-api');
let youtube;
if(process.env.API_YOUTUBE) {
    youtube = new youtubeAPI(process.env.API_YOUTUBE);
}

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const wav = require('wav');
const got = require('got')

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
        "Specify Who in the query!",
        "Sorry, who?",
        "WHO!?!?"
    ]
}
const blacklisted = ["146240326728810496"]

module.exports = async(client,msg,args) => {
    if(blacklisted.includes(msg.author.id)) return;
    if(args.length == 0) return msg.channel.send(getResponse());
    switch(args[0].toLowerCase()) {
        case "soundc":
        case "sc":
        case "scloud":
        case "soundcloud": {
            const url = args.slice(1).join(" ");
            if(!msg.guild.voiceConnection) {
                if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                await msg.member.voiceChannel.join();
            }
            let m = await msg.channel.send(`Searching for on SoundCloud`);
            got(`https://api.soundcloud.com/resolve.json?client_id=71dfa98f05fa01cb3ded3265b9672aaf&url=${url}`,{json:true})
            .then(r => {
                m.edit(`Loading **${r.body.title}**`);
                if(r.body.length == 0) return m.edit("0 Results Returned");
                let sc;
                let album = false;
                if(r.body.type === 'album') {
                    album = true;
                    m.edit('Link is an album, playing first song');
                    sc = r.body.tracks[0];
                }else{
                    sc = r.body;
                }
                let url = sc.stream_url + ((sc.stream_url.includes("?")) ? "&":"?") + "client_id=71dfa98f05fa01cb3ded3265b9672aaf";
                const dispatcher = msg.guild.voiceConnection.playStream(url)
                dispatcher.on("start",() => {
                    try {
                        client.user.setActivity(sc.title,{type:'PLAYING'})
                        msg.channel.send({embed:{
                            color:16746496,
                            author:{icon:sc.user.avatar_url},
                            description:`Now playing **[${sc.title}](${sc.uri})** by **${sc.user.username}** (${formatTimeFromSec(sc.duration/1000)})` + (album ? `\nLink was album, playing first song of this album.` : ""),
                            footer:{text:`Requested by ${msg.author.tag}` + ((sc.sharing === "private") ? ` | Private`:"")}
                        }})
                        m.delete();
                    }catch(err) {
                        console.error('[zeko] SOUNDCLOUD' + err.message)
                        m.edit(`Something happened when playing. ${err.message}`)
                    }
                })
                dispatcher.on("end",(reason) => {
                    if(reason && reason.startsWith("SKIP")) {
                        const user = client.users.get(reason.split(":")[1]);
                        const userstring = (user) ? `by ${user.tag}` : "";
                        m.edit(`Video was skipped ${userstring}`)
                    }else{
                        m.edit("Video has completed.")
                    }
                    client.user.setActivity('Prestoné',{type:'LISTENING'})
                })
                console.log(`[zeko] Playing "${sc.title}", requested by ${msg.author.tag}`)
            }).catch(err => {
                if(err.statusCode === 404) {
                    msg.channel.send({embed:{
                        color:16746496,
                        description:`Found 0 Results on SoundCloud`
                    }})
                    m.delete();
                    return;
                }
                m.edit(`Failed to search soundcloud. \n\`${err.message}\``)
            })
            break;
        } case "q_add":
            let m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}**`);
            if(!msg.guild.voiceConnection) {
                if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                await msg.member.voiceChannel.join();
            }
            this.queue.add(client,msg,args,m)
            .then(r => msg.channel.send("Added?"))
            .catch(err => {
                console.error(`[zeko/q_add] ${err.stack}`)
                msg.channel.send("bnodjmfg")
            })
            break;
        case "search": {
            if(!youtube) return msg.channel.send("Youtube support has been disabled");
            const url = encodeURIComponent(args.slice(1).join(" "));
            let m = await msg.channel.send({embed:{
                color:12857387,
                title:'Youtube Search',
                description:`Searching for **${args.slice(1).join(" ")}**`,
                footer:{text:`React to the song you want to play`}
            }})
            //let m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}** on Youtube`);
            if(!msg.guild.voiceConnection) {
                if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                await msg.member.voiceChannel.join();
            }
            if(msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.author.id === "303027173659246594") return m.edit("🚫 Forbidden preston until current song is done")
            const results = await youtube.searchVideos(args.slice(1).join(" "),5);
            if(results.length === 0) { 
                return m.edit({embed:{
                    title:`Youtube Search Results`,
                    description:`[(Link)](https://www.youtube.com/results?search_query=${url})\n` + 'Found 0 videos with that query.'
                }});
            }else{
                let index = 0;
                await m.edit({embed:{
                    title:`Youtube Search`,
                    color:12857387,
                    description:`[(Link)](https://www.youtube.com/results?search_query=${url})\n` + results.map(v => `${++index}. [${v.title}](${v.url})`).join("\n"),
                    footer:{text:`React to the song you want to play`}
                }})
                .catch(err => reject(err));
                const numbers = [ "1⃣", "2⃣", "3⃣", "4⃣", "5⃣","🚫"/*, "6⃣", "7⃣", "8⃣", "9⃣" */];
                let waiting = true;
                m.awaitReactions((reaction,user) => user.id === msg.author.id, {max:1, time: 60000 })
                .then(async(collected) => {
                    waiting = false;
                    m.clearReactions();
                    if(collected.first().emoji.name === "🚫") return m.edit("Search cancelled",{embed:null});
                    const index = numbers.indexOf(collected.first().emoji.name);
                    if(index === -1) return m.edit("Sorry, something happened when searching",{embed:null});
                    const video = await results[index].fetch();
                    const stream = ytdl(results[index].id,{ filter : 'audioonly' })
                    let lastPercent = null;
                    const dispatcher = msg.guild.voiceConnection.playStream(stream);
                    await m.edit("Loading...",{embed:null})
                    await m.clearReactions(); //just incase some reacts came late
                    stream.on("progress",(length,downloaded,total) => {
                        try {
                            let percent = Math.round((downloaded/total*100)/5)*5;
                            if(percent != lastPercent) {
                            m.edit({embed:{
                                    color:12857387,
                                    footer:{text:`${formatBytes(downloaded)}/${formatBytes(total)} | Requested by ${msg.author.tag}`},
                                    description:`Now playing **[${video.title}](https://youtu.be/${video.id})** by **${video.channel.title}** (${formatTime(video.duration)})`
                                }})
                            }
                            lastPercent = percent;
                        }catch(err) {
                            console.log(`[zeko] SEARCH:PROGRESS ERROR: ${err.message}`)
                        }
                    })
                    dispatcher.on("end",(reason) => {
                        if(reason && reason.startsWith("SKIP")) {
                            const user = client.users.get(reason.split(":")[1]);
                            const userstring = (user) ? `by ${user.tag}` : "";
                            m.edit(`Video was skipped ${userstring}`)
                        }else{
                            m.edit("Video has completed.")
                        }
                        m.edit("Video has completed.")
                        client.user.setActivity('Prestoné',{type:'LISTENING'})
                    })
                    console.log(`[zeko] Playing "${results[index].title}", requested by ${msg.author.tag}`)
                }).catch((err) => {
                    console.log(err.message)
                    m.edit(`Search has timed out for ****${args.slice(1).join(" ")}**`)
                });
                await numbers.reduce((p, e, i) => p.then(async () => {
                    if(waiting) await m.react(e)
                }), Promise.resolve());
            }
            break;
        } 
        case "youtube":
        case "yt":
        case "play": {
            if(!youtube) return msg.channel.send("Youtube support has been disabled");
            try {
                let m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}**`);
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
                let lastPercent = null;
                let msTook = null;
                stream.on("progress",(length,downloaded,total) => {
                    try {
                        let percent = Math.round((downloaded/total*100)/5)*5;
                        const timeTaken = (msTook) ? `Fetched in ${(msTook/1000).toFixed(1)} secs | ` : "";
                        const footer = `${formatBytes(downloaded)}/${formatBytes(total)} | ` + timeTaken + `Requested by ${msg.author.tag}`
                        if(percent != lastPercent) {
                        m.edit({embed:{
                                color:12857387,
                                footer:{text:footer},
                                description:`Now playing **[${results[0].title}](https://youtu.be/${results[0].id})** by **${results[0].channel.title}** (${formatTime(video.duration)})`
                            }})
                        }
                        lastPercent = percent;
                    }catch(err) {
                        console.log(`[zeko] PLAY:PROGRESS ERROR: ${err.message}`)
                    }
                })
                const dispatcher = conn.playStream(stream);
                dispatcher.on("start",() => {
                    msTook = Date.now() - start;
                   /* try {
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
                    }*/
                })
                dispatcher.on("end",(reason) => {
                    if(reason && reason.startsWith("SKIP")) {
                        const user = client.users.get(reason.split(":")[1]);
                        const userstring = (user) ? `by ${user.tag}` : "";
                        m.edit(`Video was skipped ${userstring}`)
                    }else{
                        m.edit("Video has completed.")
                    }
                    client.user.setActivity('Prestoné',{type:'LISTENING'})
                })
                console.log(`[zeko] Playing "${results[0].title}", requested by ${msg.author.tag}`)
                

            }catch(err) {
                console.log('[zeko] ' + err.stack)
                /*msg.channel.send({embed:{
                    title:'Error Occurred while Playing',
                    color:12857387,
                    description: `${err.message}`
                }});*/
                m.delete();
                msg.channel.send(`Error: ${err.message}`)
            }
            break;
        } case "vol":
        case "volume": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            if(!args[1]) return msg.channel.send("Playing at **" + ((msg.guild.voiceConnection.dispatcher.volume*100).toFixed(0)) + "%**");
            let input = parseInt(args[1]);
            if(input == NaN || input <= 0 || input > 200) {
                return msg.channel.send("Sorry, volume must be a number between 1 and 150");
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
            if(vol + .1 > 2) {
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
                    msg.guild.voiceConnection.dispatcher.end("SKIP:" + msg.author.id);
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
            let user = await client.users.filter(v => !v.bot).find(v => v.username.toLowerCase() === query || v.id === query || v.username.toLowerCase().startsWith(query) || query.startsWith(v.username.toLowerCase()));
            if(!user) return msg.channel.send(getResponse("tell"))
            user.send(`${msg.author.tag} told me to tell you: \`\`\`${args.slice(2).join(" ")}\`\`\``)
            .then(r => msg.react("👍").catch(() => {}))
            .catch(err => {
                console.log(`[zeko] tell:${user.tag} ${err.message}`)
                msg.channel.send("Sorry, I could not send your message to " + user.tag)
            });
            break;
        case "8ball":
            if(msg.content.toLowerCase().includes("steve")) {
                return msg.channel.send('Sorry, something happened while 8balling.');
            }
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
            }
            break;
        case "watson":
            let watson = null;
            if(!msg.member.voiceChannel) return msg.channel.send("you need to do a voice channel");
            msg.member.voiceChannel.join().then(async conn => {
                /*const authorization = new DiscoveryV1({
                    //username:"apikey",
                    //password: process.env.WATSON_SPEECHTEXT,
                    iam_apikey: process.env.WATSON_SPEECHTEXT,
                    version: "2018-11-20"
                    //iam_url: '<IAM endpoint URL - OPTIONAL>',
                });*/
                /*const speechToText = new SpeechToTextV1 ({
                    username:"auto-generated-apikey-bbd712bb-7e86-430f-b7ab-c602eeccbdab",
                    password: process.env.WATSON_SPEECHTEXT,
                    //iam_apikey: process.env.WATSON_SPEECHTEXT,
                    version: "2018-11-20"
                });*/
                const speechToText = new SpeechToTextV1({
                    version:"2018-11-20",
                    iam_apikey:process.env.WATSON_SPEECHTEXT
                    //url:'ws://stream.watsonplatform.net/speech-to-text/api'
                });
                await conn.playFile('./db/sounds/fixAudio.wav');
                console.log("Established connection")
                const recv = conn.createReceiver();
                const OpusStream = recv.createOpusStream(msg.author.id) 
                    
                resStream.on("data",chunk => {
                    console.log("got: ",chunk.length)
                })
                resStream.on("error",err => {
                    console.log("[zeko/watson] " + err.message)
                })
                resStream.on("stop",() => {
                    console.log("[stop]")
                })
            }).catch(err => {
                console.log('[zeko/watson',err.stack)
                return msg.channel.send("fuck\n" + err.message)
            })
            break;
        case "s2t":
            let song = args[1].toLowerCase()||"despacito.mp3";
            const fs = require('fs')
            const file = fs.createReadStream("./db/sounds/" + song);
            const speechToText = new SpeechToTextV1({
                version:"2018-11-20",
                iam_apikey:process.env.WATSON_SPEECHTEXT
                //url:'ws://stream.watsonplatform.net/speech-to-text/api'
            });
            const watStream = speechToText.recognizeUsingWebSocket({
                'content-type':"audio/mp3",
                interim_results: false,
                model:"en-US_BroadbandModel"
            })
            //wavStream.pipe(fs.createWriteStream("test.wav"))
            const resStream = file.pipe(watStream);
            //const resStream = OpusStream.pipe(watStream)
            resStream.on("open",() => {
                console.log("Starting")
                msg.channel.send(`Converting Speech to Text with **${song}**`)
            })
            resStream.on("data",chunk => {
                msg.channel.send(chunk.toString("utf8"))
                console.log(chunk.toString('utf8'))
            })
            resStream.on("error",(msg,frame,err) => {
                console.log("[zeko/watson] " + msg)
                console.log(err.message)
            }) 
            resStream.on("stop",() => {
                console.log("[stop]")
            })
            break;
        default:
           msg.channel.send(getResponse());
    }
}
const queue = {
    add: function(client,msg,args,m) {
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
                startPlaying(client,m,msg,video,msg.author.tag)
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

function startPlaying(client,m,msg,video,author) {
    client.user.setActivity(video.title,{type:'PLAYING'})
    console.log('got: ', video.id)
    if(!video.id) throw "SFDUJFSM<DFSF "
    const conn = msg.guild.voiceConnection;
    const stream = ytdl(video.id,{ filter : 'audioonly' })
    const dispatcher = conn.playStream(stream);
    dispatcher.on("start",() => {
        var date = new Date(null);
        date.setSeconds(SECONDS); // specify value for SECONDS here
        var result = date.toISOString().substr(11, 8);
        client.user.setActivity(video.title,{type:'PLAYING'})
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
            startPlaying(client,m,msg,q[0].id,q[0].tag)
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
function formatTimeFromSec(duration) {
    let min = Math.floor(duration / 60)
	let hour = Math.floor(duration / 3600);
	let time = `0:${Math.floor(duration)}`
	if(hour) {
		time = `${hour}:${(min - hour * 60).toString().padStart(2,0)}:${(duration - min * 60).toString().padStart(2,0)}`
	}else if(min) {
		time = `${min}:${(duration - min * 60).toString().padStart(2,0)}`
    }
    return time;
}
function formatTime(duration) {
    const sec = `${duration.seconds.toString().padStart(2,0)}`;
    if(!duration.minutes) {
        return `:${sec}`;
    }else if(duration.hours) {
        return `${duration.hours}:${duration.minutes.toString().padStart(2,0)}:${sec}`
    }
    return `${duration.minutes}:${sec}`;
    
}
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}