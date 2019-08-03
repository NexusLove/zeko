const fs = require('fs').promises;
const path = require('path')

const path_mod = path.join(__dirname,"/../../modules");
const path_evt = path.join(__dirname,"/../../events");
const path_cmd = path.join(__dirname,"/../../commands");

exports.run = async(client,msg,args,flags,logger) => {
	if(args[0].toLowerCase() === "list") {
        try {
            const [modules,events,commands] = await Promise.all([
                fs.readdir(path_mod),
                fs.readdir(path_evt),
                fs.readdir(path_cmd)
            ])
            msg.author.send({embed:{
                title:"Commands",
                description:commands.join("\n")
            }})
            msg.author.send({embed:{
                title:"Modules",
                description:modules.join("\n")
            }})
            msg.author.send({embed:{
                title:"Events",
                description:events.join("\n")
            }})
            
        }catch(err) {
            msg.channel.send(`⚠ **Error Occurred** ${flags.debug?err.message:err.stack}`)
        }
    }else{
        switch(args[0].toLowerCase()) {
            case "module":
            case "mod":
            case "m": {
                //only supports v2 modules
                client.moduleManager.reloadModule(args[1]).then(() => {
                    msg.channel.send(`✅ Reloaded Module **${args[1]}**`)
                }).catch(err => {
                    msg.channel.send(`⚠ **Error Occurred** ${flags.debug?err.message:err.stack}`)
                })
                break;
            } case "command":
            case "c":
            case "cmd": {
                try {
                    client.commands.delete(args[1]);
                    const filepath = require.resolve(path.join(path_cmd,args[1]))
                    delete require.cache[filepath]
                    client.commands.set(args[1],require(filepath));
    
                    msg.channel.send(`✅ Reloaded Command **${args[1]}**`)
                }catch(err) {
                    msg.channel.send(`⚠ **Error Occurred** ${flags.debug?err.message:err.stack}`)
                }
                break;
            } case "event":
            case "e": {
                //not implemented
                //return msg.channel.send("Reloading events is currently not available.")
                client.eventManager.reloadEvent(args[1]).then(() => {
                    msg.channel.send(`✅ Reloaded Event **${args[1]}**`)
                }).catch(err => {
                    msg.channel.send(`⚠ **Error Occurred** ${flags.debug?err.message:err.stack}`)
                })
                break;
            }
            default: {
                msg.channel.send("Invalid type of file. Types are: module, command, event");
            }
        }
    }
};

exports.config = {
    usageIfNotSet: true,
    flags:{
        debug:Boolean,
        core:{
            type:Boolean,
            description:"Reload core files instead of custom",
            aliases:['c']
        }
    }
};

exports.help = {
	name: 'reload',
	aliases:[
        'rl'
    ],
	description: 'Reload a custom module or a command',
	usage:'rl <module/command/event/list> [filename]'
};
 