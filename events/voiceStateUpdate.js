const fs = require('fs');
const wav = require('wav');

const record = require('../modules/record');
//speech-to-text https://www.npmjs.com/package/speech-to-text
module.exports = async(client,oldMember,newMember) => {
    //return; //disabled
    if(newMember.id === client.user.id && newMember.voiceChannel) {
        if(!oldMember.mute && newMember.mute) {
            newMember.guild.fetchAuditLogs({limit:2,type:"MEMBER_UPDATE"}).then(audit => {
                const test = audit.entries.filter(v => v.executor.id !== client.user.id && v.target.id === client.user.id)
                if(test.size > 0) {
                    const audit = test.first();
                    client.channels.get("291672183627972610").send(`${audit.executor.toString()} if you do not want me to play audio -- either locally mute me, or use \`zeko skip\``)
                }
            }).catch(() => {})
            newMember.setMute(false);
        }
        if(!newMember.deaf && oldMember.deaf) newMember.setDeaf(true);
        return;
    }
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
        if(newMember.guild.voiceConnection && newMember.guild.voiceConnection.speaking) return; //dont move if speaking
        let connection = await newMember.voiceChannel.join().catch(err => {});
        if(!connection || newMember.voiceChannel.id === '473686639034630154') return;
        await connection.playFile('./db/sounds/youpieceofshit.mp3') //dont play in think
        // setInterval(() => {
        //     if(newMember.guild.voiceConnection) {
        //         if(Math.random() > .5) {
        //             newMember.setMute(false);
        //             newMember.setDeaf(true);
        //         }else {
        //             newMember.setMute(true);
        //             newMember.setDeaf(false);
        //         }
        //     }
        // },15000)
        //await record(connection);
    }
}
