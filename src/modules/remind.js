const {data} = require('./database.js');
data.defaults({reminders:[]}).write()
const nanoid = require('nanoid/generate');
const remind = data.get("reminders");
let timer;
module.exports = {
    init(client,logger) {

        logger.info('Checking for reminders every',process.env.REMIND_UPDATE_INTERVAL||30,'seconds')
        timer = setInterval(() => {
            try {
                //logger.debug('remidner run',JSON.stringify(remind.data()))
                remind.value()
                .filter(v => {
                    return v.expires <= Date.now()
                }).forEach(v => {
                    const author = client.users.get(v.author);
                    const channel = client.channels.get(v.channel) || author;
                    channel.send(`**${author} You wished to be reminded of: **\n\`\n${client.utils.clean(v.content)}\`\n`)
                    remind.remove({id:v.id}).write();
                })
            }catch(err){
                logger.debug(err.message)
                //silently error
            }
        },(process.env.REMIND_UPDATE_INTERVAL||30)*1000)
    },
    addReminder(id,channel,when,text) {
        const reminder_id = nanoid('1234567890abcdefghijklmnopqrstuvwxyz', 10)
        remind.push({
            id:reminder_id,
            author:id,
            expires:when,
            channel:channel,
            created:Date.now(),
            content:text
        }).write();
        return reminder_id;
    },
    removeReminder(id,authorID) {
        return new Promise((resolve,reject) => {
            const find_reminder = remind.find({id,author:authorID}).value();
            if(find_reminder) {
                remind.remove({id}).write();
                resolve(true);
            }else{
                resolve(false)
            }
        })
    },
    getReminders(id) {
        return remind.filter({author:id}).value();
    },
    exit() {
        clearInterval(timer);
    }
}