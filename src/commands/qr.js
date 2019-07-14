const {Attachment} = require('discord.js');

const Jimp = require('jimp');
const qrReader = require('qrcode-reader');
const qr = require('qr-image')
exports.run = async(client,msg,args,flags,logger) => {
	if(args.length === 0 || args[0].toLowerCase() === "help") {
		return msg.channel.send('**Usage**\nview - Upload an image/URL to view\ngenerate - Makes a QR code as specified.');
	} 
	switch(args[0].toLowerCase()) {
		case "view": {
			const possibleUrl = args.slice(1).join(" ");
			if(msg.attachments.size === 0 && !possibleUrl) return msg.channel.send('Please upload an image with the command');
			if(msg.attachments.size > 0 && !msg.attachments.first().height) return msg.channel.send('Please upload an image.');
			let attachment = (msg.attachments.size > 0) ? msg.attachments.first().url : possibleUrl;
			Jimp.read(attachment)
			.then(image => {
				const qr = new qrReader();
				qr.callback = (error, result) => {
					if(error) {
					  msg.channel.send("⚠ Failed to parse QR Code: ",error.message)
					}else{
						msg.channel.send("**That QR Code says: **\n```\n" + result.result + "```");
					}
				}
				qr.decode(image.bitmap)
			}).catch(err => {
				msg.channel.send("⚠ Could not load image: " + err.message)
			})
			break;
		}case "generate":
		case "gen":
		case "create": {
			const qr_svg = qr.image(args.slice(1).join(" "), { type: 'png',margin:1});
			msg.channel.send(new Attachment(qr_svg,`qr${genHex()}.png`));
			break;
		} default:
			msg.channel.send('**Usage**\nview - Upload an image/URL to view\ngenerate - Makes a QR code as specified.')
	}
};

exports.config = {
	usageIfNotSet: true
};

exports.help = {
	name: ['qr','qrcode'],
	description: 'generates/views QR codes',
	usage:'qrcode help'
};
 

function genHex(length = 5) {
	let text = "";
  	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
  	return text;
}