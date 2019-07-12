const got = require('got')
const {
	promises: {
	  parseSemVer,
	},
} = require("semver-parser");
module.exports =  async(client, logger) => {
	logger.info(`Bot now ready`);
	//version check
	if(process.env.UPDATE_CHECK != "0") { //later should be merged into settings
		got('https://raw.githubusercontent.com/Jackzmc/zeko/master/package.json',{json:true})
		.then(async(r) => {
			const package = require('../../package.json');

			const remote = await parseSemVer(r.body.version);
			const local	= await parseSemVer(package.version);
			if(remote.major != local.major) {
				//ignore if local is more up to date (dev version, etc)
				if(remote.major > local.major) {
					logger.warn(`Your version ${local.version}. Latest is ${remote.version}`)
				}
			}else if(remote.minor != local.minor) {
				if(remote.minor > local.minor && process.env.UPDATER_IGNORE_MINOR != "1") {
					logger.info(`There is a new update: ${remote.version}. You are on: ${local.version}`)
				}
			}else if(remote.patch != local.patch) {
				if(remote.patch > local.patch && process.env.UPDATER_IGNORE_PATCH != "1") {
					logger.info(`There is a new patch available: ${remote.version}. You are on: ${local.version}`)
				}
			}
		}).catch(err => {
			logger.warn("Update Check Failed:",err.message)
		})
	}
}
