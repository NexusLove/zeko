exports.error = (error,module,opts = {}) => {
    return {
        embed:{
            color:16711731,
            title:`Module ${module.config.name} has errored`,
            description:(opts.dev) ? error.stack:error.message
        }
    }
}
const registered_modules = {};
const message_module_list = []; /* {triggers:['=math','='],module:name,*/

exports.messageHandler = (client,msg) => {
    const args = msg.content.split(/ +/g);
    const message = args.shift();
    for(let i=0;i<message_module_list.length;i++) {
        for(let k=0;k<message_module_list[i].triggers.length;k++) {
            if(message.startsWith(message_module_list[i].triggers[k])) {
                const search = registered_modules[message_module_list[i].module];
                if(search) {
                    try {
                        search.run(client,msg,args);
                    }catch(err) {
                        this.error(err,search,{dev:true})   
                    }
                }
            }
        }
        
    }
}

exports.registerCustomCommandModule = (module) => {
    if(!module.config) throw new Error(`Invalid module registered.`)
    const failed_dependencies = [];
    const failed_envs = [];
    if(module.config.dependencies) module.config.dependencies.forEach(v => {
        try {
            require.resolve(v)
        } catch(e) {
            failed_dependencies.push(v);
        }
    })
    if(module.config.envs) module.config.envs.forEach(v => {
        if(!process.env[v]) failed_envs.push(v);
    })
    if(failed_dependencies.length > 0) {
        return console.warn(`[ModuleManager] Module ${module.config.name} missing dependencies: ${failed_dependencies.join(" ")}`);
    }else if(failed_envs.length > 0) {
        return console.warn(`[ModuleManager] Module ${module.config.name} missing envs: ${failed_envs.join(" ")}`);
    }
    console.info(`[ModuleManager] Registered Module ${module.config.name}`);
    registered_modules[module.config.name] = module;
    message_module_list.push({triggers:module.config.triggers,module:module.config.name});
}