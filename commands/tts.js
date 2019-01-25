const fs = require('fs-extra');
const textToSpeech = require('@google-cloud/text-to-speech');
//const client = new textToSpeech.TextToSpeechClient();
const {Attachment} = require('discord.js');
exports.run = async(client,msg,args,flags) => {
	if(args[0]) {
		//const gender = "FEMALE";
		const gender = flags.gender||'NEUTRAL';
		const lang = flags.lang||"en-US";
		const voice = flags.voice;
		const input = (flags.ssml) ? {ssml:msg.cleanContent.split(" ").slice(3).join(" ")} : {text:args.slice(1).join(" ")};
		if(args[0].toLowerCase() == "say") {
			try {
				if(!args[1]) return msg.channel.send("Please enter a message");
				const client = new textToSpeech.TextToSpeechClient();
				if(!msg.guild.voiceConnection && !msg.member.voiceChannel) return msg.channel.send("I'm not in a voice channel, either join one or make me join one.");
				const request = {
					input,
					voice: {languageCode: lang, name:voice,ssmlGender: gender},
					audioConfig: {audioEncoding: 'MP3'},
				}
				if(!msg.guild.voiceConnection && msg.member.voiceChannel) await msg.member.voiceChannel.join();
				const [response] = await client.synthesizeSpeech(request);
				await fs.writeFile(__dirname + '/../db/output.mp3',response.audioContent,'binary');
				await msg.guild.voiceConnection.playFile(__dirname + '/../db/output.mp3',{volume:1.5});
				await msg.react('✅')
			}catch(err) {
				console.log("[tts] error: " + err.message);
				msg.channel.send("**Failed to process TTS:**\n" + err.message)
			}
			return;
		} else if(args[0].toLowerCase() == "export") {
			try {
				if(!args[1]) return msg.channel.send("Please enter a message");
				const m = await msg.channel.send(`⌛ Processing... Please Wait. `);
				const client = new textToSpeech.TextToSpeechClient();
				const request = {
					input,
					voice: {languageCode: lang, name:voice,ssmlGender: gender},
					audioConfig: {audioEncoding: 'MP3'},
				}
				const name = flags.name ? (flags.name.includes(".mp3") ? flags.name : `${flags.name}.mp3`) : "yeet.mp3";
				const [response] = await client.synthesizeSpeech(request);
				const attachment = new Attachment(response.audioContent,name);
				await m.delete();
				await msg.channel.send(attachment)
			}catch(err) {
				console.log("[tts] error: " + err.message);
				msg.channel.send("**Failed to export TTS:**\n" + err.message)
			}
			return;
		}else if(args[0].toLowerCase() == "voices") {
			const client = new textToSpeech.TextToSpeechClient();
			const [result] = await client.listVoices({});
			let index = 0;
			const text = result.voices.map(v => {
				++index;
				return `**${index}. ${v.name}** ${v.ssmlGender}`
			}).join("\n");
			msg.author.send(`**__Voices are as followed:__**\n` + text,{split:true})
			return;
		}
	}
	return msg.channel.send("**Usage: ** `" + this.help.usage + "`");
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'tts',
	aliases:[],
	example:'**Use a different voice**\n`>tts say voice=en-US-Standard-B This is a text you want to say`\n**Use a different gender**\n`>tts say gender=FEMALE this is a test in a female voice`\n**Use Speech Synthesis Markup Language (SSML)**\n`>tts say ssml=1 <speak>What the heck?<break time="5s"></break>Please</speak>`',
	description: 'text to speech using Google Wavenet.',
	fields:[
		{
			name:"Flags",
			value:"**name** name of the exported file\n**voice** the voice (>tts voices for list). Overwrites lang & gender\n**lang** set the language\n**gender** set the gender of voice\n**ssml** turn on ssml processing mode"
		}
	],
	usage:'tts <say/export> [flags] <words>'
};
 