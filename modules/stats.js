const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const db = low(new FileSync('./db/stats.json'));
db.defaults({users:{},global:{imgs:0,stats:0,optout:[]}}).write();
exports.db = db;
exports.init = (client) => {

}