const {stripIndents} = require('common-tags')
const moment = require('moment');
const ms = require('parse-duration');

const moduleManager = require('../modules/loaders/ModuleManager').getInstance(); //module manager doesnt support core
const remind = moduleManager.getModule('remind',{core:true});
//const remind = require('../modules/remind');
exports.run = (client,msg,args) => {
    switch(args[0].toLowerCase()) {
        case "list":
            const reminders = remind.getReminders(msg.author.id);
            if(reminders.length === 0) {
                return msg.channel.send("You have no reminders");
            }else{
                const text = reminders.map((v,i) => {
                    return stripIndents`**__${++i}. ${v.id}__**
                        **Expires:** ${moment(v.expires).utc().format('MMMM Do YYYY, hh:mm a [UTC]')} (${moment().to(v.expires)})
                        **Created:** ${moment(v.created).utc().format('MMMM Do YYYY, hh:mm a [UTC]')} (${moment(v.created).fromNow()})
                        **Message:**
                        \`\`\`\n${v.content}\`\`\`
                    `
                })
                msg.channel.send(text.join("\n"))
            }
            break;
        case "new":
        case "add":
            if(args.length >= 3) {
                const expires = moment().add(ms(args[1]), 'milliseconds').valueOf();
                if(expires - new Date() < 59000) {
                    return msg.channel.send("Reminder must be at least one minute")
                }

                const id = remind.addReminder(msg.author.id,msg.channel.id,expires,args.slice(2).join(" "))
                msg.channel.send(`**✅ Created reminder ${id}**`)
            } else {
                msg.channel.send(`Invalid Usage. **Usage:** ${this.help.usage}`)
            }
            break;
        case "remove":
            if(args[1]) {
                const id = args[1].trim();
                remind.removeReminder(id,msg.author.id)
                .then(result => {
                    if(result) {
                        msg.channel.send(`**✅ Removed reminder ${id}**`)
                    }else{
                        msg.channel.send("Reminder either doesnt exist or is not yours.");
                    }
                })
            }else{
                msg.channel.send("Please enter ID of reminder")
            }
            break;
        case "help":
            msg.channel.send(stripIndents`**Reminder Help**
            1. list - view all active reminders
            2. new/add <when> <text> - create a new reminder
            3. remove <id> - remove a reminder\n
            Type \`help reminder\` for examples`)
            break;
        default:
            msg.channel.send(`**Usage:** ${this.help.usage}`)
    }
};

exports.config = {
	usageIfNotSet: true
};

exports.help = {
	name: ['remind','rmd','r'],
    description: 'View & Manage your reminders',
    example:'**adding a reminder**\n\`remind add 5d bring milk\`',
	usage:'remind help'
};
 