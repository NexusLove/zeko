let logger;
module.exports = class ModuleManager {
    constructor(client) {
        this.modules = {};
        this.legacy_message_module_list = [];
        this.client = client;
        logger = new client.Logger('ModuleManager',{type:'module'});
    }    
    messageHandler(msg) {
        const args = msg.content.split(/ +/g);
        const message = args.shift();
        for(let i=0;i<this.legacy_message_module_list.length;i++) {
            for(let k=0;k<this.legacy_message_module_list[i].triggers.length;k++) {
                if(message.toLowerCase().startsWith(this.legacy_message_module_list[i].triggers[k].toLowerCase())) {
                    const search = this.modules[this.legacy_message_module_list[i].module];
                    if(search) {
                        try {
                            search.run(this.client,msg,args);
                        }catch(err) {
                            this.error(err,search,{dev:true})   
                        }
                        return;
                    }
                }
            }
            
        }
    }
    reloadModule(name) {
        return new Promise((resolve,reject) => {
            const module = this.modules[name];
            module
            if(!module) reject(new Error(`ModuleManager: No module found for ${name}`));
            if(module.reloadable != null && !module.reloadable) {
                reject(new Error(`ModuleManager: Module ${name} cannot be reloaded.`))
                logger.warn(`Reloading module ${name} failed: Not Reloadable`)
                return;
            }
            if(module.exit) {
                module.exit()
                .then(() => {
                    this._reload(module)
                    .then(() =>  {
                        logger.info(`Successfully reloaded module ${name}`)
                        resolve();
                    });
                })
                .catch(err => {
                    reject(err);
                    logger.error(`Reloading module ${name} failed: ${err.stack}`);
                })
            }else{
                this._reload(module)
                .then(() => {
                    logger.info(`Successfully reloaded module ${name}`)
                    resolve();
                }).catch(err => {
                    logger.error(`Reloading module ${name} failed: ${err.message}`);
                    reject(err);
                })
            }
        })
    }
    registerModule(module) {
        return new Promise(async(resolve,reject) => {
            if(!module.config) reject(new Error(`Invalid module registered.`));
    
            this._moduleCheck(module)
            await this._reload(module);
    
            if(module.config.command) this._registerCommandModule(module);
            logger.debug(`Registered ${module.config.command?"Command ":""}Module ${module.config.name}`);
            resolve();
        })
    }
    getModule(query) {
        return this.modules[query];
    }
    getModules() {
        return this.modules;
    }

    //private methods
    _reload(module) {
        const _this = this;
        return new Promise((resolve,reject) => {
            try {
                //delete this.modules[module.config.name];
                delete require.cache[require.resolve(`../../modules/${module.config.name}.js`)];
                const newModule = require(`../../modules/${module.config.name}.js`)
                newModule.config.name = module.config.name;
                //do logic on register modules
                _this.modules[module.config.name] = newModule;
                if(newModule.init) newModule.init(_this.client);
                resolve();
            }catch(err) {
                reject(err);   
            }
        })
    }
    _registerCommandModule(module) {
        this.legacy_message_module_list.push({triggers:module.config.triggers,module:module.config.name}); //command module
    }
    _moduleCheck(module) {
        if(!module.config.type) logger.warn(`Module ${module.config.name} is missing a module version type.`)
        if(module.config.command && module.config.triggers.length == 0) {
            logger.warn(`Module ${module.config.name} is a command with no triggers`)
        }
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
            return logger.warn(`Module ${module.config.name} missing dependencies: ${failed_dependencies.join(" ")}`);
        }else if(failed_envs.length > 0) {
            return logger.warn(`Module ${module.config.name} missing envs: ${failed_envs.join(" ")}`);
        }
    }
}