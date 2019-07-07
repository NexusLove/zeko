const fs = require('fs').promises

const registered_modules = {};
exports.cache = new Map();
const message_module_list = []; /* {triggers:['=math','='],module:name,*/
let client;

exports.init = (client) => {
    this.client = client;
}

exports.messageHandler = (client,msg) => {
    const args = msg.content.split(/ +/g);
    const message = args.shift();
    for(let i=0;i<message_module_list.length;i++) {
        for(let k=0;k<message_module_list[i].triggers.length;k++) {
            if(message.toLowerCase().startsWith(message_module_list[i].triggers[k].toLowerCase())) {
                const search = registered_modules[message_module_list[i].module];
                if(search) {
                    try {
                        search.run(client,msg,args);
                    }catch(err) {
                        this.error(err,search,{dev:true})   
                    }
                    return;
                }
            }
        }
        
    }
}
exports.reloadModule = (name) => {
    return new Promise((resolve,reject) => {
        const module = registered_modules[name];
        module
        if(!module) reject(new Error(`ModuleManager: No module found for ${name}`));
        if(module.reloadable != null && !module.reloadable) {
            reject(new Error(`ModuleManager: Module ${name} cannot be reloaded.`))
            console.warn(`[ModuleManager] Reloading module ${name} failed: Not Reloadable`)
            return;
        }
        if(module.exit) {
            module.exit()
            .then(() => {
                internalReloadModule(module)
                .then(() =>  {
                    console.info(`[ModuleManager] Successfully reloaded module ${name}`)
                    resolve();
                });
            })
            .catch(err => {
                reject(err);
                console.error(`[ModuleManager] Reloading module ${name} failed: ${err.message}`);
            })
        }else{
            internalReloadModule(module)
            .then(() => {
                console.info(`[ModuleManager] Successfully reloaded module ${name}`)
                resolve();
            }).catch(err => {
                console.error(`[ModuleManager] Reloading module ${name} failed: ${err.message}`);
                reject(err);
            })
        }
    })
}
exports.registerModule = (module) => {
    if(!module.config) throw new Error(`Invalid module registered.`)
    const failed_dependencies = [];
    const failed_envs = [];
    moduleCheck(module)
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
    registered_modules[module.config.name] = module;
    if(module.config.command) registerCommandModule(module);
    console.info(`[ModuleManager] Registered ${module.config.command?"Command ":""}Module ${module.config.name}`);
}
exports.error = (error,module,opts = {}) => {
    return {
        embed:{
            color:16711731,
            title:`Module ${module.config.name} has errored`,
            description:(opts.dev) ? error.stack:error.message
        }
    }
}

exports.findModule = (search) => {
    const module = registered_modules[search];
    if(!module) throw new Error(`Module ${search} not found`);
    return module;
}

function internalReloadModule(module) {
    return new Promise((resolve,reject) => {
        try {
            //delete registered_modules[module.config.name];
            delete require.cache[require.resolve(`./${module.config.name}.js`)];
            const newModule = require(`./${module.config.name}.js`)
            //do logic on register modules
            registered_modules[module.config.name] = newModule;
            if(newModule.init) newModule.init(client);
            resolve();
        }catch(err) {
            reject(err);   
        }
    })
}

function registerEventModule(module) {
    throw new Error("Not Implemeneted");
}
function registerCommandModule(module) {
    message_module_list.push({triggers:module.config.triggers,module:module.config.name}); //command module
    //add extra configuration
}
function moduleCheck(module) {
    if(!module.config.type) console.warn('[ModuleManager]',`Module ${module.config.name} is missing a module version type.`)
    if(module.config.command && module.config.triggers.length == 0) {
        console.warn('[ModuleManager]',`Module ${module.config.name} is a command with no triggers`)
    }
    //todo: add dependency check
}