const fs = require('fs');
const opusscript = require('opusscript');
//const wav = require('wav');
require('dotenv').load();
let writer = null;

/*module.exports = (connection) => {
    if(!connection) throw 'Missing a connection variable'
    console.log('got connection')
    
    const receiver = connection.createReceiver();
    writer = fs.createWriteStream(__dirname + `/../recordings/${process.env.RECORD_ID}-${Date.now()}.pcm`)
    connection.on('speaking',(user,speaking) => {
        if(!connection) return;
        if(!speaking || user.id !== process.env.RECORD_ID) return;
        console.log('speaking')
        const audioStream = receiver.createPCMStream(user);
        
        //const writer = new wav.FileWriter(__dirname + `/../recordings/${process.env.RECORD_ID}-${Date.now()}.wav`);
        audioStream.pipe(writer)
        audioStream.on('end',() => {
            audioStream.destroy();
        })
    })
    let loop = setInterval(() => {recordFile(writer)},30000)
    connection.on('disconnect',() => {
        console.log('Writing to file')
        clearInterval(loop);
        writer.end();
        receiver.destroy();
    })
}*/
module.exports = (connection) => {
    if(!connection) throw "Missing connection";
    console.log('[recorder] Got Connection')
    //const encoder = new opusscript(48000, 2, opusscript.Application.AUDIO);
    const receiver = connection.createReceiver();
    receiver.on("error",(err) => {
        console.log("sh " + err.message)
    })
    receiver.on("opus",(user,opus) => {
        console.log(buffer.length)
    })
    const stream = receiver.createOpusStream("117024299788926978");
    stream.on("data",(data) => {
        console.log('got data')
    })
    //const decoded = encoder.decode(stream);
    connection.playOpusStream(stream);
}
function recordFile(writer) {
    console.log('Writing 30s')
    writer.end();
    writer = fs.createWriteStream(__dirname + `/../recordings/${process.env.RECORD_ID}-${Date.now()}.pcm`)
}