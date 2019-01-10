exports.config = {
    triggers:["test123"],
    dependencies:[],
    try:5,
    command:true
}
exports.run = async(client,msg,args) => {
    if(args.length === 0) {
        return msg.channel.send("Does reload work? try5");
    }
    return msg.channel.send("I'm working!")
}
exports.exit = async(client) => {
    return new Promise((resolve,reject) => {
        resolve("Yes");
    })
}