const {Attachment} = require('discord.js');

const qr = require('qr-image');
const Canvas = require('canvas')
const got = require('got')
const jqr = require('jsqrcode')(Canvas);

const Image = Canvas.Image;

exports.run = async(client,msg,args) => {
	if(args[0] === "view") {
		return msg.channel.send('Disabled, blame node-canvas\' Windows support')
		console.log('Starting decode of QR Code');
		if(msg.attachments.size === 0) return msg.channel.send('Please upload an image with the command');
		if(!msg.attachments.first().height) return msg.channel.send('Please upload an image.');
		let attachment = msg.attachments.first();
		let body = await got(attachment.url)

		const image = new Image();

		image.onload = () => {
			let result;
			try{
				result = qrcode.decode(image);
				return msg.channel.send({embed:{
					title:'QR Code',
					description:result
				}})
			}catch(e){
				return msg.channel.send('Could not decode that QR Code');
			}
		}
		image.src = Buffer.from(body.body,'binary')
	}else if(args[0] === "generate" || args[0] === "create") {
		var qr_svg = qr.image(args.slice(1).join(" "), { type: 'png',margin:1});
		return msg.channel.send(new Attachment(qr_svg,`qr${genHex()}.png`));
	}
	return msg.channel.send('**Usage**\nview - Upload an image/URL to view\ngenerate - Makes a QR code as specified.')
};

exports.config = {
	usageIfNotSet: false
};

exports.help = {
	name: 'qr',
	aliases:['qrcode'],
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