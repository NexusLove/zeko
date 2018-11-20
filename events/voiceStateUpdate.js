const fs = require('fs');
const wav = require('wav');

const record = require('../modules/record');
//speech-to-text https://www.npmjs.com/package/speech-to-text
module.exports = async(client,oldMember,newMember) => {
    //return; //disabled
    if(newMember.voiceChannel && newMember.voiceChannel.id ===  '473686639034630154') return;
    if(newMember.voiceChannel && newMember.voiceChannel.id === '473686639034630154') return;
    if(oldMember.voiceChannel && oldMember.voiceChannel.id === '473686639034630154') return;
    if(newMember.id !== process.env.RECORD_ID) return;
    if(!newMember.voiceChannel) {
        if(!oldMember.voiceChannel) return;
        if(!oldMember.guild.voiceConnection) return;
        if(newMember.guild.voiceConnection && newMember.guild.voiceConnection.speaking) return; //stop, is playing something
        if(oldMember.voiceChannel.id == oldMember.guild.voiceConnection.channel.id) return oldMember.voiceChannel.leave();
        return;
    }
    if(oldMember.voiceChannel && newMember.voiceChannel.id == oldMember.voiceChannel.id) return;
    if(!newMember.guild.voiceConnection || newMember.voiceChannel.id !== newMember.guild.voiceConnection.channel.id) {
        //join
        
        let connection = await newMember.voiceChannel.join().catch(err => {});
        if(!connection || newMember.voiceChannel.id === '473686639034630154') return;
        await connection.playFile('./db/sounds/youpieceofshit.mp3') //dont play in think
        //await record(connection);
    }
}
