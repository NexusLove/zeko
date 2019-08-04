const git = require('simple-git/promise')(__dirname + "/../")
const { exec } = require("child_process");
exports.run = async(client,msg,args,flags,logger) => {
	//todo: owner check
	if(!client.permissions.isAuthorized(msg.author.id,'owner')) {
		return msg.channel.send("You do not have permission to use this command.");
	}
	try {
		let remote = "origin", branch = "master", tag;
		if(flags.branch) {
			if(remote && args[0]) args[0].toLowerCase()
			if(branch && args[1]) args[1].toLowerCase()
		}else{
			if(/^v\d+.\d+/m.test(args[0])) {
				tag = args[0].toLowerCase()
			}else{
				return msg.channel.send("⚠ Tag is not valid version of `vX.Y.Z` Example: v1.6.5")
			}
		}
		const updated = flags.branch ? `${remote}/${branch}` : tag;
		const m = await msg.channel.send({embed:{
			color:client.color,
			title:`⏳ Pulling ${updated}`,
			description:'Please wait...'
		}})

		const response = flags.branch ? await git.pull(remote,branch) : await git.checkout(tag)
		let yarn = await execPromise('yarn --version')
		.catch(() => {});
		let packages_update = (yarn) ? 'yarn install':'npm install';
		try {
			await m.edit({embed:{
				color:client.color,
				title:"⏳ Updating dependencies...",
				description:`Running \`${packages_update}}\``
			}})
			await execPromise(packages_update)
			await m.edit({embed:{
				color:5212688,
				title:'✅ Success!',
				description:`Updated ${remote}/${branch}\n${response.summary.changes} changes, ${response.summary.insertions} insertions, ${response.summary.deletions} deletions${(flags.restart)?`\nNow restarting.`:''}`,
				timestamp:new Date()
			}})
			if(flags.restart) {
				console.info('[dev] Bot updated & is now restarting.');
				return process.exit();
			}
		}catch(err) {
			m.edit({embed:{
				color:15549239,
				title:'Update Error',
				description:err.message
			}})
		}
		
	}catch(err) {
		m.edit({embed:{
			color:15549239,
			title:'Git Pull Error',
			description:err.message
		}})
	}
};

exports.config = {
	usageIfNotSet: true,
	flags:{
		branch: {
			type:Boolean,
			description:"Instead of tags, use branches",
		}
	}
};

exports.help = {
	name: ['update'],
	description: 'Update the bot by running a git pull command',
	usage:'update <tag version>'
};
 
function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}