const fs = require('fs-extra');
const schedule = require('node-schedule');
let birthdayModule; 
const whys = ["When","Why","Where","How","Who","Who's"];
let toDisconnect = [];
module.exports =  async(client) => {
    setInterval(() => {
        client.voiceConnections.forEach(conn => {
            const users = conn.channel.members.filter(v => !v.user.bot).size
            /*console.log(toDisconnect)
            for(let i=0;i<toDisconnect.length;i++) {
                if(users === 0) {
                    toDisconnect[i].disconnect().catch(() => {})
                }else{
                    toDisconnect.splice(i,1);
                }
            }
            console.log(conn.channel.name,users)*/
            if(users === 0 && toDisconnect) {
                //console.log("Pushing",conn.channel.name,users)
                //toDisconnect.push(conn);
                setTimeout(() => {
                    try {
                        if(conn.channel.members.filter(v => !v.user.bot).size === 0) conn.disconnect()
                    }catch(err) {
                        console.log("[ready]",err)
                    }
                },1.8e+6)
                //conn.disconnect().catch(err => console.error('[ready] ' + err.message));
            }
            //todo: time out feature?
        })
    },5000);
    birthdayModule = client.moduleManager.findModule("birthday");
    require('../modules/server.js')(client);
    client.user.setActivity('Prestoné',{type:'LISTENING'})
    schedule.scheduleJob({hour: 6, minute: 00}, async() => {
        //should be a scheduler, debugging for now
        if(!birthdayModule) {
            const bds = birthdayModule.checkForBirthdays();
            //birthdayModule.config.activeGuilds
            const guilds = birthdayModule.config.activeGuilds;
            bds.forEach(v => {
                const user = client.users.get(v.id);
                if(!user) return;
                guilds.forEach(guild => {
                    const discord_guild = client.guilds.get(guild.id);
                    if(!guild) return;
                    if(discord_guild.members.has(v.id)) {
                        const channel = discord_guild.channels.get(guild.channel);
                        if(!channel) return;
                        channel.send(`${user.toString()}'s birthday is today!`)
                    }
                })
            })
        }
    });
}