# About
A modular discord.js bot that comes loaded with useful commands and easy to use loading system.

## Getting Started

1. Clone the repo
`git clone git@github.com:Jackzmc/zeko.git`
2. Get discord token from https://discordapp.com/developers
3. Create a ".env" file and add:
`TOKEN=<your discord bot token>`
4. Install node packages (`npm install`)
5. Start your bot (`node index.js`)

## Features
* Dynamic file loading (folder-based)
* Hot Reloadable modules (core and custom)
* Custom logging system
* Premade commands to use
* Command help system
* Command flag system (linux getopts)

## Documentation
Visit the [wiki](https://github.com/jackzmc/zeko/wiki) for more information

## License
[MIT License](https://github.com/Jackzmc/zeko/blob/master/LICENSE)

## Environmental Variables
**\* Required**
```env
*TOKEN = discord bot token
LOGGER_DEBUG_LEVEL = debug level of logger. Will be ignored if PRODUCTION is true
LOADER_AUTO_RELOAD = enable auto reloading of modules/commands/events
DATABASE_AUTOSAVE_INTERVAL = duration (ms) to autosave data.db & settings.db
UPDATER_IGNORE_[minor/patch] = Updater will ignore minor or patch updates
OWNER_IDS = gives access to eval command. Comma separated list of ids
```
