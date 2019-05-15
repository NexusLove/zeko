module.exports = async(client,member) => {
    if(member.id === "303027173659246594") member.setNickname("Steve*")
    if(member.guild.id === '137389758228725761' && member.user.bot) {
        if(!member.guild.me.hasPermission(['MANAGE_ROLES_OR_PERMISSIONS'])) return; 
        await member.setMute(true)
        await member.addRole('351156886818521089','[Auto Bot Role]')
        //.catch(() => {})
    }
}