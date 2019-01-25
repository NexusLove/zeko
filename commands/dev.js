require('dotenv').load();
const got = require('got')
const {getSong} = require('../modules/alexa.cache.js');

const git = require('simple-git/promise')(__dirname + "/../")
const { exec } = require("child_process");

const fs = require('fs-extra');
const textToSpeech = require('@google-cloud/text-to-speech');
//const client = new textToSpeech.TextToSpeechClient();
const {Attachment} = require('discord.js');
exports.run = async(client,msg,args) => {
if(!args[0]) return msg.channel.send('❌ Not');
switch(args[0].toLowerCase()) {
    case "rejoin":
        if(args[1] && args[1] === "activate") {
            if(msg.author.id !== "117024299788926978") return msg.channel.send("NO PERM");
            return;
        } 
        msg.channel.send("Go to http://mc.jackz.me:8010/rejoin/login")
        break;
    case "reload":
        return await client.moduleManager.reloadModule(args[1]).then(r => {
            msg.channel.send("Success! " + r||"");
        }).catch(err => {
            return msg.channel.send("Failed to reload module\n" + err.message);
        })
        break;
    case "join":
        break;
    case "math": {
        let series = [];
        let input = args.slice(1).join(" ").split(",");
        input.forEach(v => {
            let b = parseInt(v);
            if(!isNaN(b)) series.push(b);
        })
        const r = series[1] - series[0]; //
        const a1 = series[0];
        let converges = (series >= 1);
        let n = 0; //# of terms
        let findN = [a1];
        console.log('r',r);
        
        console.log('a1',a1);
        console.log((converges) ? 'Converges':'Deverges');
        series.forEach(v => {
            const val = findN[findN.length - 1] * r;
        
            if(val > series[series.length - 1]) return;
            findN.push(val)
        })
        n = (findN[findN.length - 1] !== series[series.length - 1]) ? 'Error' : findN.length;
        console.log('n',n);
        return msg.channel.send({embed:{
            title:series.join(","),
            description:`**${(converges) ? 'Converges':'Diverges'}**\n**a1** ${a1}\n**r** ${r}\n**n** ${n}`
        }});
    }case "steves": {
        const failedUsers = msg.guild.members.filter(v => {
            const name = v.nickname||v.user.username; 
            console.log(name,name.toLowerCase().includes("steve"))
            return !name.toLowerCase().includes("steve")
        });
        console.log(failedUsers.map(v => v.user.username))
        msg.channel.send(
            "These ~~losers~~ users do not follow the Steve Rule:\n```\n" + 
            failedUsers.map(v => v.user.username).join("\n") +
            "```"
        )
        break;
    } case "voice": {
        try {
            const client = new textToSpeech.TextToSpeechClient();
            const text = (args.length > 1) ? msg.cleanContent.split(" ").slice(2).join(" ") : "HELLO EPIC GAMERS JOHN WICK IS DEAD";
            const request = {
                input: {text},
                voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                audioConfig: {audioEncoding: 'MP3'},
            }
            if(!msg.guild.voiceConnection && msg.member.voiceChannel) await msg.member.voiceChannel.join();
            const [response] = await client.synthesizeSpeech(request);
            await fs.writeFile(__dirname + '/../db/output.mp3',response.audioContent,'binary');
            await msg.guild.voiceConnection.playFile(__dirname + '/../db/output.mp3',{volume:1.5});
            await msg.react('✅')
        }catch(err) {
            console.log("error: " + err.message);
            msg.channel.send("yeah something happened... \n" + err.message)
        }
        break;  
    } case "voice-export": {
        try {
            const m = await msg.channel.send(`⌛ Processing... Please Wait. `);
            const client = new textToSpeech.TextToSpeechClient();
            const text = (args.length > 1) ? args.slice(1).join(" ") : "HELLO EPIC GAMERS JOHN WICK IS DEAD";
            const request = {
                input: {ssml:`<speak>Rise<break time="1s"></break>and<break time="1s"></break>shine<break time="1s"></break>doctor<break time="1s"></break> <audio src="http://overwikifiles.com/files/Wallace_Breen/Br_oheli03.ogg"> didn't get your MP3 audio file</audio></speak>`},
                voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                audioConfig: {audioEncoding: 'MP3'},
            }
            
            const [response] = await client.synthesizeSpeech(request);
            const attachment = new Attachment(response.audioContent,"yeet.mp3");
            await m.delete();
            await msg.channel.send(attachment)
        }catch(err) {
            console.log("error: " + err.message);
            msg.channel.send("yeah something happened... \n" + err.message)
        }
        break;  
    } case "voices" : {
        const client = new textToSpeech.TextToSpeechClient();
        const [result] = await client.listVoices({});
        let index = 0;
        const text = result.voices.map(v => {
            ++index;
            return `**${index}. ${v.name}** ${v.ssmlGender}`
        }).join("\n");
        msg.author.send(`**__Voices are as followed:__**\n` + text,{split:true})
        break;  
    } case "cache":
        try {
            const result = getSong(args[1]);
            console.log(result)
            msg.guild.voiceConnection.playStream(result);
            break;
        }catch(err) {
            console.log(err.stack)
            msg.channel.send(err.message);
        }
        break;
    case "update": {
        const remote = args[1] ? args[1].toLowerCase() : "origin";
        const branch = args[2] ? args[2].toLowerCase() : "master";
		const m = await msg.channel.send({embed:{
			color:client.color,
			title:`⏳ Pulling ${remote}/${branch}`,
			description:'Please wait...'
		}})
        git.pull(remote,branch)
        .then(async(response) => {
            let yarn = await execPromise('yarn --version')
            .catch(() => {});
            let command = (yarn) ? 'yarn install':'npm install';
    
            let e = await execPromise(command)
            .catch(err => m.edit({embed:{
                color:15549239,
                title:'Update Error',
                description:err.message
            }}));
            if(!e) return;
    
            await m.edit({embed:{
                color:client.color,
                title:"⏳ Updating dependencies...",
                description:`Running: \`${command}}\``
            }})
            await m.edit({embed:{
                color:5212688,
                title:'✅ Success!',
                description:`Updated ${remote}/${branch}\n${response.summary.changes} changes, ${response.summary.insertions} insertions, ${response.summary.deletions} deletions${(restart)?`\nNow restarting.`:''}`,
                timestamp:new Date()
            }})
            if(restart) {
                console.info('[dev] Bot updated & is now restarting.');
                return process.exit();
            }
        })
		.catch(err => m.edit({embed:{
			color:15549239,
			title:'Git Error',
			description:err.message
        }}));
        break;
    }
    default:
        msg.channel.send("❌ Reeeeeeeee ")
}
};

exports.config = {
    hidden:true,
	usageIfNotSet: false
};

exports.help = {
	name: 'dev',
	aliases:[],
	description: 'development shit OK???',
	usage:'die'
};

function unicodeToBinary(char) {
    return char.split('').map(function(codepoint) {
        return padLeftTo(codepoint.charCodeAt(0).toString(2), 0, 16);
    }).join('').replace(/0/g,CHAR0).replace(/1/g,CHAR1);
}

function binaryToUnicode(binaryList) {
    binaryList = binaryList.replace(RGX_CHAR0,0).replace(RGX_CHAR1,1).split("");
    let codepointsAsNumbers = [];
    while( binaryList.length>0 ){
        var codepointBits = binaryList.slice(0,16);
        binaryList = binaryList.slice(16);
        codepointsAsNumbers.push( parseInt(codepointBits.join(''),2) );
    }
    return String.fromCharCode.apply(this,codepointsAsNumbers);
}

function padLeftTo(string, padChar, numChars) {
    return (new Array(numChars-string.length+1)).join(padChar) + string;
}
function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}