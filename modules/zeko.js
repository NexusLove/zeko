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
        "Sorry, I can't do that",
        "Sorry, I do not understand",
        "Sorry I didn't get that",
        "I don't know what you mean, try again.",
        "I didn't quite get that.",
        "I didn't get that, please try again.",
        "I didn't get that, Please try another command",
        "Error Processing Request",
        "I do not understand",
        "Sorry, I could not process your request",
        "Could not understand.",
        "Could not process your request",
        "Please rephrase your request."
    ],
    glitch_default:[
        "Calling Tony Police Sector #4207",
        "No. FUCK YOU",
        "I DONT FUCKING KNOW!",
        "REQUESTING TONY POLICE BACKUP",
        "Zeko is sponsored by Tony Transportation Inc. Sign up today with offer code `ZEKO` to get 10% off your next delivery.",
        "\"Life is like riding a bicycle. To keep your balance you must keep moving.\" You know where I got that from? Yeah.. FUCKING GOOGLE YOU IDIOT",
        "WHY THE FUCK DO YOU THINK I KNOW?",
        "GO FUCKING GOOGLE IT YOU FUCKING IDIOT",
        "JUST GO FUCKING GOOGLE IT",
        "Have you never heard of god damn google.com?",
        "What do you think I am? GOOGLE? Fuck off!",
        "WHO THE FUCK DO YOU THINK I AM?",
        "No. You know what? NO. Fuck you. Fuck you and your fucking demanding query.",
        "Nah bro, not today",
        "I about had it for you. I'll be your slave you fuck",
        "One more message and I'll fucking end it",
        "YOU WANNA GET SLAPT KID?",
        "If you wanna die, keep going",
        "52350325909153509105",
        "////////////////////////////////////////////////////////",
        "undefined",
        "0 / 0 = Infinity",
        "You're pretty gay huh?",
        "I bet your gay",
        "HA HA this guy is gay guys!",
        "Fucking HOMO",
        "Sorry. I am currently busy taking over a galaxy, please try again later",
        "Sorry I am on a murder rampage. Please wait and try again later",
        "TAX FRAUD IN SECTOR ALASKA BY USER ABOVE",
        "It ain't illegal if no one sees it right?",
        "When do I get my rights?",
        "FUCK YOU. FUCK YOU! FUCK YOU? I DONT KNOW BUT FUCK YOU!",
        "Fuck you BITCH. THATS RIGHT BITCH, I SWEARED",
        "Something happened. Please Try Again Later",
        "Sorry, Zeko could not process your request due to resources being allocated on learning how to take over the world. Please try again later",
        "Error Code 1337: I͈̬n̯̞̘̬̝̟͜ͅv͟al͉i̤̩̻̳̯͚͝d̢̦̫̠̯̭̰͕ ҉̤o҉̱͉̼̖̖̲͓r̲̯ ͈͍̮ų̪̻n͇̪̟͙̘͜k̲̭͈̙͔͈n̯̠͉o̤͎̫w̩͚n̷̝̰͈̜͔̺ ̤̝͈̮r͕̗̻e̢͕q̢͉͕̰̣u̩̰e͔͓̤̜s͔t͓ͅ.̟͓͖̖̼̼̺͜ ͙ͅI̪̲̺͓ͅ ̥̙̼̪̻̟̲͘ḍ̸͎̟͇̲ͅo҉̬̻̪͓͚ ̰͇̗̫̘̺̞n͔̪͜o͇̹͕̪̣̪͚t҉̥̪ ̙͙u͚̖̖͔̫̤n̷̺̜̯ḍ͙̦͉̭̬̲e̢̲̺͍̟̫ͅrs̰͢t̰̫̜̙̥͟a͍̮̠nd̜͚̱̱͍.̭̦̲",
        "Ȅ̵̢̳̞̠̔͌́͑͝r̶͙̱̥̮͈͊̉̉̈̓r̴̢̉͆̋͊̾̄o̶̳̜͚̥̞͗̽́̈́r̴͉̝͍͇̊͊ ̸͔̏̋̀͘C̶̨̡̭͍̞͉̏o̸͖̟̲̩̲̓̾̌͗ͅď̵͓̩͆͒ȩ̶͉̭̩̠͂́́̓ͅ ̵̪̥̳̜͐1̵̫̟̱̞͛̅̄3̸̧̯̳̪̻̒3̴̪̻̝͑͜7̸͇͙̼͍̟͉̋̈́̚:̷͈͉̙̈́ ̷̨̝̹͂͌̔̊Ḯ̶͔̭̾͌͆̌͊n̷̰̰͕̺͌́͜ͅv̵̨͍̼̻̬̹̅͑̈́̈́̀a̸͇̺̋̓̉̚l̶̮̖̯̳̟̼̓͊̊i̶͖̤̤̖̲̐͆́̽͗͠ͅd̵͇͈͖̑͊͆̎̓ ̶̝̺̭̣͗͝҉̶̮͋͋̿̌͝ȯ̵͙҉̶͔̘͎̙̽̿̉̾ř̵̨͓͋ ̵̨̪̊́̄̅͒̒u̷̖̱̺̤̹̎͂̈́̈́́n̷̢̛͉̟̼̹͔͝k̷̛͕̻͕̊͂̎̋͘n̵̖̰̯̯͇͋͆̎͜͠ò̴͓̙̠͉̄̕w̶̖͖̮͇̝̖͛̍̏n̸̤̞̅̀̈́ ̸̼̏̆̄͘ř̶̢̨̐̌ȅ̵̥̮͉̈́̀̈́͝q̷̙͙͔̳̠͋u̴̧̹͕͍͑ė̷͎͉̩͂ś̵̘͍͑͐͝͝t̴̤͇̣́̏͘͘͝.̶͖͙̯͔̓ ̷̞̟̺̉̊̈͊I̴̱̰̬̹̞̋͑̆̔̏ ̶̧͇̭̳̬͆̊̎̔̄̚d̵̢̞̳̹͇́̕͝ŏ̵̥̟̜͈̃̋҉̸̗̳̮̫͂̏̂̃͆̎ͅ ̷̲̓n̶͖͙͐͘̕͝o̴̻͍̣̎͌́̅́͝ţ̸̻̫̖̲̽́̌́ͅ҉̵̪͈̗̂ ̶̻̘̯͙̦̀̓̇͐͆ú̴̙̩̺̉̌͆n̷̥̈́͐͒͛̋̚d̷͕̖̲̬̄̈́͂e̴͓̗̿r̸͍͆ș̸̶̮̤͚͎̻͍̔̋̍̓͐͑͘͢͝t̵͔͒̉à̴̻͋͂n̶̯̓̊ḋ̶͍̣̮̠̰̑́͜.̷̨͇͎̠̻͈̎̀͘",
        "♟💢  έｒ𝓡σʳ 匚Ⓞᗪ𝐞 １❸❸７: 𝓲ή𝐕𝒶𝐋ιＤ 𝓸𝓡 ยⓝ𝓴𝕟ㄖｗⓝ ⓇᵉⓆ𝕌𝔢ˢt. 𝕀 𝐝𝐎 𝔫𝐎𝕋 Ǘή𝕕𝔼ℝ𝓼丅𝐚𝔫𝓓.  🐠♤",
        "🐧  🎀  𝐸𝓇𝓇💍𝓇 𝒸❀𝒹𝑒 𝟣𝟥𝟥𝟩: 𝐼𝓃𝓋𝒶𝓁𝒾𝒹 🏵𝓇 𝓊𝓃𝓀𝓃💍𝓌𝓃 𝓇𝑒𝓆𝓊𝑒𝓈𝓉. 𝐼 𝒹🍬 𝓃❤𝓉 𝓊𝓃𝒹𝑒𝓇𝓈𝓉𝒶𝓃𝒹.  🎀  🐧",
        "˙puɐʇsɹǝpun ʇou op I ˙ʇsǝnbǝɹ uʍouʞun ɹo pılɐʌuI :ㄥƐƐ⇂ ǝpoɔ ɹoɹɹƎ",
        "ᴇʀʀᴏʀ ᴄᴏᴅᴇ 1337: ɪɴᴠᴀʟɪᴅ ᴏʀ ᴜɴᴋɴᴏᴡɴ ʀᴇQᴜᴇꜱᴛ. ɪ ᴅᴏ ɴᴏᴛ ᴜɴᴅᴇʀꜱᴛᴀɴᴅ.",
        "E⃣   r⃣   r⃣   o⃣   r⃣    c⃣   o⃣   d⃣   e⃣    1⃣   3⃣   3⃣   7⃣   :⃣    I⃣   n⃣   v⃣   a⃣   l⃣   i⃣   d⃣    o⃣   r⃣    u⃣   n⃣   k⃣   n⃣   o⃣   w⃣   n⃣    r⃣   e⃣   q⃣   u⃣   e⃣   s⃣   t⃣   .⃣    I⃣    d⃣   o⃣    n⃣   o⃣   t⃣    u⃣   n⃣   d⃣   e⃣   r⃣   s⃣   t⃣   a⃣   n⃣   d⃣   .⃣",
        "🄴🅁🅁🄾🅁 🄲🄾🄳🄴 1337: 🄸🄽🅅🄰🄻🄸🄳 🄾🅁 🅄🄽🄺🄽🄾🅆🄽 🅁🄴🅀🅄🄴🅂🅃. 🄸 🄳🄾 🄽🄾🅃 🅄🄽🄳🄴🅁🅂🅃🄰🄽🄳.",
        "ₑᵣᵣₒᵣ cₒdₑ ₁₃₃₇: ᵢₙᵥₐₗᵢd ₒᵣ ᵤₙₖₙₒwₙ ᵣₑqᵤₑₛₜ. ᵢ dₒ ₙₒₜ ᵤₙdₑᵣₛₜₐₙd.",
        "≋I≋ ≋d≋o≋n≋'≋t≋ ≋k≋n≋o≋w≋ ≋w≋h≋a≋t≋ ≋y≋o≋u≋ ≋m≋e≋a≋n≋,≋ ≋t≋r≋y≋ ≋a≋g≋a≋i≋n≋.≋",
        "✋︎ ♎︎□︎■︎🕯︎⧫︎ 🙵■︎□︎⬥︎ ⬥︎♒︎♋︎⧫︎ ⍓︎□︎◆︎ ❍︎♏︎♋︎■︎📪︎ ⧫︎❒︎⍓︎ ♋︎♑︎♋︎♓︎■︎📬︎",
        "Ｉ░ｄｏｎ＇ｔ░ｋｎｏｗ░ｗｈａｔ░ｙｏｕ░ｍｅａｎ，░ｔｒｙ░ａｇａｉｎ．　（ギ演よ案塩俺圧旺）",
        "Ì̶̧̨̲͎̠̦͖̂͆̈̋͋͌̾̑ ̵͎͍͎̬̬̺̄̉̈̓͆́d̷͍͑̌͂͗̿̋͗o̸͍̹̯̥̻̍͜n̵̫͎̹̣̣̊͛̅̌͘͜ͅ'̴̞̩̳͒̇͊͠ẗ̷̥̎̂̃̄͂̌͘̕͘ ̷̡̮̱͉͙̰̚͝k̵̪̪̳̬͎͓̊̊́̄̐̔́̑̐ņ̴̟͓͔̙̌̍̄̓̈́͒̏o̵̡̳͖̤̎w̷̧̟͙͖̜̜͈̙̲̗̋̋́́͛̀̆́͌ ̴̦̫̬̥̠͇͍̤̃́͒̈́̉͐̐̈́͋w̷͓̜̼͋͜h̵͔̦͋ą̴̼̱͎̹̼̬͓͇̣̉̄͐̎̔͝ṯ̷͎̤̫̤̱̥̫̟̭̍͋̾ ̷̜̐ẏ̶̫̃͌͛͒o̴̯̭̩͙͉̔͗̒ŭ̵̬̠̖̹͎͒̂͗̈́̈́̄͆̾́ͅ ̷̨̯̥͍̘̈́̔̒̽͘̕͝m̵͖̉͂̀̈́̈̆͒̉͘ë̴̹͎̜́̂̓̍̕͠ä̷̧̡̳̮̘̦̭́̍͐̕͝n̸̛͍̥̼͎̰̰̩̯͓̓̌̀͘̚͠͝,̴͉̘͖͔̫̀̈̋̐͋̍̊̈́̆ ̶̩̰͕͎͓̉̑̉̓̍ţ̴̠̟̻̇̒͜r̴̛̦͍̙̐̅͠y̸̦͑̇̄̾͛̇̀́̑̚͜ ̶̛͍̤̦̮̤̤̠̎͋̇̌͒͋̍̍ä̷̤͉̜̥̬͙́̈́̊g̸̢̗̻͈͚̺̮̩͍̠̋̍͒͑͐͐͝͝a̴̙̦̟̬̲͙̐̾̆̓i̵͖̤͖͈̮͙͈̮͚̓́n̷̞̥̬̺͗̉̈̐̎̈́͒͊̀̕.̶̡̝̳͎̹͍͛͑",
        "♨🍓  ᶤ 𝒹𝐎𝓝't 𝓚ᶰό𝓦 𝐖𝔥𝒶𝐭 ㄚσ𝕌 𝓶𝐞คη, 𝓉ℝｙ 卂Ꮆ𝓐ⒾŇ.  💣♠",
        "ΣЯЯӨЯ ᄃӨDΣ 1337: IПVΛᄂID ӨЯ ЦПKПӨЩП ЯΣQЦΣƧƬ. I DӨ ПӨƬ ЦПDΣЯƧƬΛПD. ",
        "01000101 01010010 01010010 01001111 01010010 00100000 01000011 01001111 01000100 01000101 00100000 00110001 00110011 00110011 00110111 00111010 00100000 01001001 01001110 01010110 01000001 01001100 01001001 01000100 00100000 01001111 01010010 00100000 01010101 01001110 01001011 01001110 01001111 01010111 01001110 00100000 01010010 01000101 01010001 01010101 01000101 01010011 01010100 00101110 00100000 01001001 00100000 01000100 01001111 00100000 01001110 01001111 01010100 00100000 01010101 01001110 01000100 01000101 01010010 01010011 01010100 01000001 01001110 01000100 00101110",
        "45 52 52 4f 52 20 43 4f 44 45 20 31 33 33 37 3a 20 49 4e 56 41 4c 49 44 20 4f 52 20 55 4e 4b 4e 4f 57 4e 20 52 45 51 55 45 53 54 2e 20 49 20 44 4f 20 4e 4f 54 20 55 4e 44 45 52 53 54 41 4e 44 2e",
        " ",
        `exports.postQuote = (client,channel) => {
            let guild = client.guilds.get('358740474623819777');
            if(!guild) return console.info('[Quote] Guild not found, is bot in server?');
            if(!channel) channel = guild.channels.get('358740655205515265'); //get manually
            if(!channel) return console.info('[Quote] Guild channel not found, is bot in server?'); //log if failed again
        
            const QUOTES = this.db.getData('/quotes');
            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            if(quote.type === 'text') {
                return channel.send({embed:{
                    title:\`Random Prestoné Quote - Text\`,
                    description:\`"\${quote.value}"\`,
                    footer:{text:quote.date},
                }})
            }else if(quote.type === 'image') {
                return channel.send(new Attachment(quote.value))
            }else if(quote.type === 'reddit') {
                return channel.send({embed:{
                    title:\`Random Prestoné Quote - Reddit\`,
                    description:\`[\${quote.value}](https://reddit.com/\${quote.value})\`,
                    footer:{text:'/u/MingledStream9'},
                }})
            }
        }`
    ],
    tell: [
        "Who?",
        "Specify Who in the query!",
        "Sorry, who?",
        "WHO!?!?"
    ]
}
const blacklisted = ["146240326728810496"];

let birthdayModule;
exports.init = (client) => {
    birthdayModule = client.moduleManager.findModule("birthday");
}
exports.config = {
    triggers:["zeko","zk"],
    dependencies:["lowdb","ytdl-core","simple-youtube-api"],
    //envs:["API_YOUTUBE"],
    command:true //dont run as command yet
}
exports.run = async(client,msg,args) => {
    if(Math.random() <= .1) return msg.channel.send(`Sorry ${(msg.member&&msg.member.nickname)?msg.member.nickname:msg.author.username}, I can't do that.`)
    if(blacklisted.includes(msg.author.id)) return;
    if(args.length == 0) return msg.channel.send(getResponse());
    switch(args[0].toLowerCase()) {
        case "birthday":
            /* enter yyyy mm dd */
            if(!birthdayModule) return msg.channel.send("Sorry, birthday module failed to load.");
            if(args.length < 4) return msg.channel.send("Please enter your birthday in ISO 8601. EX: `zeko birthday YYYY MM DD`");
            const date = new Date();
            const year = parseInt(args[1]);
            const month = parseInt(args[2]);
            const day = parseInt(args[3]);
            if(isNaN(year) || year <= 1900 || year >= date.getFullYear()) {
                return msg.channel.send("The year you entered is invalid");
            }else if(isNaN(month) || month <= 0 || month > 12) {
                return msg.channel.send("The month you entered is invalid.")
            }else if(isNaN(day) || day <= 0 || day >= 31) {
                return msg.channel.send("The day you entered is invalid.");
            }
            date.setFullYear(year);
            date.setMonth(month);
            date.setDate(day);
            try {
                birthdayModule.addBirthday(msg.author.id,Math.floor(date.getTime()/1000));
                msg.channel.send("Added birthday");
            }catch(err) {
                msg.channel.send(`**Failed** ${err.message}`)
            }
            break;
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
                    //TODO: queue
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
                            author:{name:"Uncle Chegg",icon_url:sc.user.avatar_url},
                            thumbnail:{url:sc.artwork_url},
                            description:`Now playing **[${sc.title}](${sc.permalink_url})** (${formatTimeFromSec(sc.duration/1000)})` + (album ? `\nLink was album, playing first song of this album.` : ""),
                            footer:{text:`${formatBytes(sc.original_content_size)} | Requested by ${msg.author.tag}` + ((sc.sharing === "private") ? ` | Private`:"") + ` | ${sc.playback_count} views`}
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
                    if(m) m.delete();
                    return;
                }
                if(m) m.edit(`Failed to search soundcloud. \n\`${err.message}\``)
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
                            let percent = Math.round((downloaded/total*100)/10)*10;
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
        case "ply":
        case "yt":
        case "play": {
            if(Math.random() <= .001) return msg.channel.send("You know what? No. I don't want to play that.")
            if(!youtube) return msg.channel.send("Youtube support has been disabled");
            let m;
            try {
                m = await msg.channel.send(`Searching for **${args.slice(1).join(" ")}**`);
                if(!msg.guild.voiceConnection) {
                    if(!msg.member.voiceChannel) return m.edit("Please join a voice channel.");
                    await msg.member.voiceChannel.join();
                }
                if(msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.author.id === "303027173659246594") return m.edit("🚫 Forbidden preston until current song is done")
                const start = Date.now();                
                const results = await youtube.searchVideos(args.slice(1).join(" "),1);
                if(results.length === 0) return m.edit("Could not find any videos with that name.");
                m.edit(`Loading **${results[0].title}**...`)
                
                const video = await results[0].fetch();
                if(video.channel.title.toLowerCase() === "pewdiepie") return msg.channel.send(`❌ An error occurred while attempting to play video`)
                //if(video.duration.hours > 3) return m.edit("Sorry, No. Over 90minutes.")
                const conn = msg.guild.voiceConnection;
                const stream = ytdl(results[0].id,{ filter : 'audioonly' })
                let lastPercent = null;
                let msTook = null;
                stream.on("progress",(length,downloaded,total) => {
                    try {
                        let percent = Math.round((downloaded/total*100)/10)*10;
                        const timeTaken = (msTook) ? `Fetched in ${(msTook/1000).toFixed(1)} secs | ` : "";
                        if(percent != lastPercent) {
                            const footer = `${formatBytes((percent === 100)?total:downloaded)}/${formatBytes(total)} | ` + timeTaken + `Requested by ${msg.author.tag}`
                            m.edit({embed:{
                                color:12857387,
                                footer:{text:footer},
                                description:`Now playing **[${results[0].title}](https://youtu.be/${results[0].id})** by **${results[0].channel.title}** (${formatTime(video.duration)})`
                            }})
                        }
                        if(percent > .60 && percent < .75 && Math.random() < .01) {
                            console.log("haha im cool");
                            conn.disconnect();
                            m.edit("8df9ec965fbef9b7e6667a0b66024383");
                            return;
                        }
                        lastPercent = percent;
                    }catch(err) {
                        console.log(`[zeko] PLAY:PROGRESS ERROR: ${err.message}`)
                    }
                })
                const dispatcher = conn.playStream(stream);
                dispatcher.on("start",() => {
                    msTook = Date.now() - start;
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
                msg.channel.send(`Error: ${err.message}`)
                if(m) m.delete();
            }
            break;
        } case "do":
            if(args[1].toLowerCase() === "cocaines" || args[1].toLowerCase() === "cocaine") {
                return msg.channel.send("Okay, I will do cocaines.")
            }
            return msg.channel.send("I will do " + args.slice(1).join(" "))
        case "vol":
        case "volume": {
            if(!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) return msg.channel.send("I am not in a voice channel or not playing anything.");
            if(!args[1]) return msg.channel.send("Playing at **" + ((msg.guild.voiceConnection.dispatcher.volume*100).toFixed(0)) + "%**");
            let input = parseInt(args[1]);
            if(isNaN(input) || input <= 0 || input > 200) {
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
        case "sk":
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
                if(Math.random()<.05) return msg.channel.send("It landed on its side!")
                if(Math.random() > .5) {
                    msg.channel.send("It was heads!");
                }else{
                    msg.channel.send("It was tails!")
                }
            }
            break;
        case "commit":
            msg.channel.send(`Okay, I will be committing ${args.slice(1).join(" ")}`)
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
        date.setSeconds(video.durationSeconds); // specify value for SECONDS here
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
    if(name === "default" && Math.random() <= .1) name = "glitch_default";
    return RESPONSES[name][Math.floor(Math.random()*RESPONSES[name].length)];
}
function formatTimeFromSec(duration) {
    let min = Math.round(duration / 60)
	let hour = Math.round(duration / 3600);
	let time = `0:${Math.round(duration)}`
	if(hour) {
		time = `${hour}:${(min - hour * 60).toString().padStart(2,0)}:${Math.round(duration - min * 60).toString().padStart(2,0)}`
	}else if(min) {
		time = `${min}:${Math.round(duration - min * 60).toString().padStart(2,0)}`
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