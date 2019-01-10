exports.error = (error,module,opts = {}) => {
    return {
        embed:{
            color:16711731,
            title:`Module ${module.config.name} has errored`,
            description:(opts.dev) ? error.stack:error.message
        }
    }
}
const registered_modules = [];
const message_module_list = []; /* {triggers:['=math','='],module:name,*/

exports.messageHandler = (client,msg,args,flags) => {
    const args = msg.content.split(/ +/g);
    const msg = args.shift();
    for(let i=0;i<message_module_list.length;i++) {
        for(let k=0;k<message_module_list[i].triggers.length;k++) {
            if(msg.content.startsWith(message_module_list[i].triggers[k])) {
                registered_modules.filter(v => v.config.name === message_module_list[i].module) {
                    
                    return console.log("FOUND MODULE: " + message_module_list[i])
                }
                //
            }
        }
        
    }
}

exports.registerListener = (module) => {
    console.info(`Registered Module ${module.config.name}`);
    registered_modules.push(module);
    message_module_list.push({triggers:module.config.triggers,module:module.config.name});
}