const queue = {
    //guild: []
}; //to be saved in file
class QueueManager {
    constructor(client,voiceChannel) { //voiceConnection
        this.client = client;
        this.voiceChannel = voiceChannel;
        this.guildID = voiceChannel.guild.id;
        this.videos = []; //use internal ^?
    }

    get videos() {
        return this.videos;
    }

    addVideo(streamSource,requester,extra = {}) { //possibly raw stream?
        if(!queue[this.guildID]) queue[this.guildID] = []
        this.videos.push({
            source:streamSource,
            requester,requester,
            extra,
        })
        this.process
    }

    removeVideo() {

    }
}
/* 
doc:
new qm = QueueManager(client,voiceConnection)
qm.addVideo(streamSrc,author,extra)
qm.videos
qm.removeVideo(?idk?)
qm.on('finished)

zeko.js:
    init:
        new QueueManager(client)
        .addVideo(streamSrc,author,extra)
        .play(voiceConn)
- OR - 
    qm = new QueueMAnager(client,guildID);
    qm.addVideo(streamSrc)
    qm.getQueue()
    > qm.on('finished')

   QueueManager.getQueue(guildID)
   QueueManager.addVideo(streamSrc) 
*/
module.exports = QueueManager;