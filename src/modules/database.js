const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')

const data = low(new FileSync(path.join(__dirname,"../../db/data.json")));
data.defaults({}).write();
const settings = low(new FileSync(path.join(__dirname,"../../db/settings.json")));
//const loki = require('lokijs');
module.exports = {data,settings}
// new loki("data.db",{
//     autoload: true,
// 	autoloadCallback : initalizeData,
// 	autosave: true, 
//     autosaveInterval: process.env.DATABASE_AUTOSAVE_INTERVAL||60000
// })
// exports.settings = new loki("settings.db",{
//     autoload: true,
// 	autoloadCallback : initalizeSettings,
// 	autosave: true, 
//     autosaveInterval: process.env.DATABASE_AUTOSAVE_INTERVAL||60000
// });

// function initalizeData() {
    
// }
// function initalizeSettings() {

// }