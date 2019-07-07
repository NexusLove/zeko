const fs = require('fs').promises;
const schedule = require('node-schedule');
let birthdayModule; 
const whys = ["When","Why","Where","How","Who","Who's"];
let toDisconnect = [];

const eco = require('../modules/economy').db;
module.exports =  async(client) => {
    const log = new client.Logger("ready.once",{type:'event'});
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
                        log.error(err)
                    }
                },1.8e+6)
                //conn.disconnect().catch(err => console.error('[ready] ' + err.message));
            }
            //todo: time out feature?
        })
    },5000);
    require('../modules/server.js')(client);
    client.user.setActivity('Prestoné',{type:'LISTENING'})

    const trainEmpire = client.guilds.get("551224997268553729");
    const warnChat = trainEmpire.channels.get("551225517949321236");

    const stevesChat = client.channels.get("291672183627972610")
    schedule.scheduleJob({hour: 6, minute: 0}, async() => {
        //should be a scheduler, debugging for now
        //check train
        if(trainEmpire && warnChat) {
            const failedCheck = [];
            trainEmpire.members.forEach(v => {
                if(v.roles.has("551225839908552744") || v.roles.has("551225814033760276")) return;
                const name = v.nickname||v.user.username;
                if(!name.toLowerCase().includes("train")) {
                    failedCheck.push(v);
                }
            })
            if(failedCheck.length > 0) {
                warnChat.send("**The Following Members Are In Violation of Rule 1:**\n" + failedCheck.map(v => `${v.toString()}`).join("\n")
                + "\nFailure to comply will result in punishment."
                );

            }
        }
        /*if(stevesChat) {
            const failedCheck = [];
            stevesChat.guild.members.forEach(v => {
                if(v.roles.has("371123829155823627") || v.roles.has("523273422105477130") || v.roles.has("546112985215533057")) return;
                const name = v.nickname||v.user.username;
                if(!name.toLowerCase().includes("steve")) {
                    failedCheck.push(v);
                }
            })
            if(failedCheck.length > 0) {
                warnChat.send("**The Following Members Are In Violation of Rule 1:**\n" + failedCheck.map(v => `${v.toString()}`).join("\n")
                + "\nFailure to comply will result in punishment."
                );

            }
        }*/
    });
    var moneySchedule = schedule.scheduleJob({dayOfWeek: 0,hour:6}, function(){
        log.info('Payday time.')
    });
}