let last_presence = {};
let channel;

module.exports = (client,oldMember,newMember) => {
    if(!channel) channel = client.channels.get('291672183627972610')
    return;
    console.log(newMember.id,newMember.presence.clientStatus.mobile,oldMember.presence.clientStatus.mobile)
    if(newMember.presence.clientStatus.mobile === "online") {
        if(oldMember.presence.clientStatus.mobile && oldMember.presence.clientStatus.mobile !== "offline") {
            if(channel) {
                channel.send(`${newMember.toString()} get off your phone.`)
            }else{
                console.warn('[presenceUpdate] Channel not found')
            }
        }
    }
}