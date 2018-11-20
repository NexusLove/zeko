const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs-extra');
const path = require('path');

exports.db = low(new FileSync('./db/alexa.music.json'));
this.db.defaults({songs:[]}).write();

exports.getSong = (videoID) => {
    const file = path.join(__dirname,`/../db/cache/${videoID}.mp3`);
    let stream;
    fs.stat(file, (err,stat) => { 
        if(err == null) {
            console.log(`${videoID} does exist`);
            stream = fs.createReadStream(file);
        } else if(err.code == 'ENOENT') {
            console.log(`${videoID} does not exist`);
            stream = ytdl(videoID,{filter:'audioonly'});
        } else {
            throw err;
        }
    }); 
    return stream;
}