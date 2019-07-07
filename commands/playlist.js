const folder = "../db/playlists";
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/playlists.json');
const db = low(adapter);
db.defaults({playlists:[]}).write();

const quality = 24; //* 1000;

const uuid = require('uuid/v4');
const fs = require('fs').promises;
exports.run = async(client,msg,args,flag) => {
    if(args.length === 0) return msg.channel.send("Please add a sopng nanemt and any options");
    switch(args[0].toLowerCase()) {
        case "create": {
            if(!args[1]) return msg.channel.send("Please add a list of songs. Ex: `>p create despacito despacito jeopardy` ");
            let obj = {
                id: uuid(),
                name: flag.name,
                author: msg.author.id,
                songs: []
            };
            let failedMatches = [];
            const songs = await fs.readdir("./db/sounds");
            args.slice(1).forEach(v => {
                let foundsong = songs.find(songn => {
                   return songn.split(".")[0] === v;
                });
                if(foundsong) obj.songs.push(foundsong);
                if(!foundsong) failedMatches.push(v);
            })
            if(obj.songs.length === 0) return msg.channel.send("Playlist not created, no songs were found.");
            if(obj.songs.length === 1) return msg.channel.send("A minimum of two songs must be added.");
            db.get('playlists').push(obj).write();
            if(failedMatches.length > 0) msg.channel.send(`Could not find these songs: \`${failedMatches.join(" ")}\`\nTry downloading them with \`>dl <url> <name>\``)
            msg.channel.send(`Created playlist of **${obj.songs.length}** songs. \n**ID:** \`${obj.id}\``);
            break;
        } case "p":
        case "play": {
            if(!args[1]) return msg.channel.send("Please specify an alias or ID of a playlist");
            let playlist = db.get('playlists').find({name:args[1].toLowerCase()}).value() || db.get('playlists').find({id:args[1]}).value();
            if(!playlist) return msg.channel.send(`Could not find any playlists.`);
            if(!msg.guild.voiceConnection && !msg.guild.me.voiceChannel) {
                if(!msg.member.voiceChannel) return console.log("I cannot join if you arent in a channel u fuck");
                await msg.member.voiceChannel.join();
            }else if(msg.guild.me.voiceChannel) {
                await msg.guild.me.voiceChannel.join();
            }
            msg.channel.send(`Now playing playlist **${playlist.name||playlist.id}** with ${playlist.songs.length}`);
            let songs = (flag.random||flag.shuffle) ? shuffle(playlist.songs) : playlist.songs;
            await playList(msg.guild.voiceConnection,playlist.songs,msg.author,0);
            msg.channel.send("Playlist has completed")
            break;
        } case "list": {
            if(!args[1]) return msg.channel.send("Please specify an alias or ID of a playlist");
            let playlist = db.get('playlists').find({name:args[1].toLowerCase()}).value() || db.get('playlists').find({id:args[1]}).value();
            if(!playlist) return msg.channel.send(`Could not find any playlists.`);
            let user = client.users.get(playlist.author);
            user = (user) ? user.tag : "_Unknown_"
            msg.channel.send(`**${playlist.songs.length}** Songs for playlist **${playlist.name||playlist.id}** by **${user}**:\n\`\`\`` + playlist.songs.map(v => v).join("\n") + "```")
            break;
        } case "name": {
            if(!args[1] || !args[2]) return msg.channel.send("Please provide the ID and name of the song. EX: `>p name e7012207-0311-4050-acec-ed34b0822a6f mySongList` ");
            const playlist = db.get('playlists').find({id: args[1]}).value();
            if(!playlist) return msg.channel.send("Could not find that playlist with that ID.");
            if(playlist.author != msg.author.id) return msg.channel.send("You must be the author of the playlist to change the name!");
            const possibleMix = db.get('playlists').find({name: args[1].toLowerCase()}).value();
            if(possibleMix) return msg.channel.send("There is already a playlist with that alias");
            //possibly check name being overwritten
            //if !args[2] && song.name, delete song.name : else say need name
            db.get('playlists').find({id: args[1]}).assign({name:args[2].toLowerCase()}).write();
            msg.channel.send(`${(playlist.name && playlist.name !== "")?'Changed':'Set'} alias to \`${args[2].toLowerCase()}\` for playlist \`${args[1]}\``)
            break;
        } case "mine": {
            const playlists = db.get('playlists').filter({author:msg.author.id});
            if(playlists.length === 0) return msg.channel.send("You have no playlists");
            msg.channel.send(`You have ${playlists.length} playlists: \`\`\`${playlists.map(v => v.name||v.id).join(" ")}\`\`\``)
            break;
        } case "songs": {
            const files = await fs.readdir("./db/sounds");
            msg.channel.send("Files: ```" + files.join("\n") + "```");
            break;
        } case "delete":
            msg.channel.send("no");
            break;
        default:
            msg.author.send("Unknown option! Try: `create, play. name, delete, list, mine`");
    }
};

exports.config = {
	enabled: true,
	usageIfNotSet: false,
	permissions:0,
    group:'fun',
    flags:{
        name: "string",
        shuffle: "boolean"
    }
};
exports.help = {
	name: 'playlist',
	aliases:['p'],
	description: 'Set up a playlist',
	usage:'playlist help'
};
const path = "./db/sounds/";
async function playList(connection,songs,author,index = 0) {
    return new Promise((resolve,reject) => {
        try {
            const dispatcher = connection.playFile(`${path}${songs[index]}`,{bitrate:quality});
            console.log('Playing',path + songs[index])
            dispatcher.on("debug",(err) => console.log(err))
            dispatcher.on('end',(reason) => {
                index++;
                if(index === songs.length) {
                    resolve();
                    return console.log("Playlist over",reason);
                }
                setTimeout(() => playList(connection,songs,author,index).then(() => resolve()),200);
            })
        }catch(err) {
            reject(err);
        }
    });
}
function shuffle(array){var currentIndex=array.length,temporaryValue,randomIndex;while(0!==currentIndex){randomIndex=Math.floor(Math.random()*currentIndex);currentIndex-=1;temporaryValue=array[currentIndex];array[currentIndex]=array[randomIndex];array[randomIndex]=temporaryValue}
return array}
/*
p create <song#1> <song#2>
p name <id> <name>
p play <id/name>
p delete <id>
{
    author:id,
    name:null
    songs:[

    ]
}
*/