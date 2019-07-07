const fs = require('fs').promises;
const colors = require('colors');
let client;
module.exports = {
    config:{
        type:'internal'
    },
    loadCommands(client) {
        //run internal check for custom folder. only need it for commands as its first
        internalCustomCheck(); 

        const folders = ['../commmands','../custom/commands'];
        folders.forEach(path => {
            fs.readdir(path, (err, files) => {
                if (err) console.error(err);
                console.log(`[core] Loading ${files.length} commands.`);
                files.forEach(f => {
                    fs.stat(`${path}/${f}`, (err, stat) => {
                        if(f.split(".").slice(-1)[0] !== "js") return;
                        if(f.startsWith("_")) return;
                        try {
                            let props = require(`${path}/${f}`);
                            if(!props.help || !props.config) return console.warn(`[core] \x1b[33mWarning: ${f} has no config or help value. \x1b[0m`);
                            props.help.description = props.help.description||'[No description provided]'
                            if(props.init) props.init(client);
                            props.help.aliases.forEach(alias => {
                                client.aliases.set(alias, props.help.name);
                            });
                            client.commands.set(props.help.name, props);
                        }catch(err) {
                            console.error(`[core] \x1b[31mCommand ${f} had an error:\n    ${err.stack}\x1b[0m`);
                        }
                    });
                });
            });
        })
        
    },
    loadEvents(client) {
        fs.readdir('../events/', (err, files) => {
            if (err) console.error(err);
            console.log(`[core] Loading ${files.length} events.`);
            files.forEach(file => {
              if(file.split(".").slice(-1)[0] !== "js") return; //has to be .js file *cough* folder that doesnt exist *cough*
              const eventName = file.split(".");
              eventName.pop();
                  try {
                  const event = require(`./events/${file}`);
                  if(!event || typeof event !== 'function') {
                      return console.warn(`[core] \x1b[33mWarning: ${file} is not setup correctly!\x1b[0m`);
                  }
                  if(eventName.length >= 2 && eventName[1].toLowerCase() === "once") {
                    client.once(eventName[0], event.bind(null, client));
                  }else{
                    client.on(eventName, event.bind(null, client));
                  }
                  delete require.cache[require.resolve(`./events/${file}`)];
                  }catch(err) {
                  console.error(`[core] \x1b[31mEvent ${file} had an error:\n    ${err.stack}\x1b[0m`);
                  }
            });
        });
    },
    loadModules() {
        fs.readdir('../modules/', (err, files) => {
            if (err) console.error(err);
            console.log(`[core] Checking for modules to load..`);
            files.forEach(f => {
                fs.stat(`./modules/${f}`, (err, stat) => {
                    if(f.split(".").slice(-1)[0] !== "js") return;
                    if(f.startsWith("_")) return;
                    try {
                        let props = require(`./modules/${f}`);
                        if(!props.config) return; //not a custom module
                        props.config.name = f.split(".")[0];
                        if(props.init) props.init(client);
                        client.moduleManager.registerModule(props);
                    }catch(err) {
                        console.error(`[core] \x1b[31mModule ${f} had an error:\n    ${err.stack}\x1b[0m`);
                    }
                });
            });
        });
    }
}

function internalCustomCheck() {
    try {
        fs.readdir('../custom/');
    }catch(err) {
        console.log(err.message)
        console.log("Creating custom folder")
        fs.mkdir('../custom/')
        fs.mkdir('../custom/commands')
        fs.mkdir('../custom/events')
        fs.mkdir('../custom/modules')
    }
}