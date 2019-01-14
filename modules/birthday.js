const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/birthday.json');
const db = low(adapter);
db.defaults({dates:[]}).write();
/*
[
    {
        "id":"discord_id",
        "timestamp:":Date.now()
    }
]
*/
exports.config = {
    activeGuilds: [
        {
            guild:"291672183627972610",
            channel:"312396863594692608"
        }
    ]
}
exports.checkForBirthdays = function() {
    const dates = db.get("dates").value();
    const _date = new Date();
    const _month = _date.getMonth();
    const _day = _date.getDay();
    
    const birthdays = [];
    dates.forEach(v => {
        const date = new Date(v.timestamp);
        const month = date.getMonth(); 
        const day = date.getDay();
        if(month == _month && day == _day) {
            birthdays.push(v);
        }
    })
    return birthdays;
}
exports.addBirthday = function(userID,date) {
    db.get("dates").push({id:userID,timestamp:date}).write();
}
exports.run = async(client,msg,args) => {
    
}
exports.exit = async(client) => {
    return new Promise((resolve,reject) => {
        resolve("Yes");
    })
}