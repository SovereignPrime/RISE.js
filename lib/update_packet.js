class UpdatePacket {
	constructor(subject, text, version, attachments, time){
		this.subject = subject;
		this.text = text;
		this.version = version;
		this.attachments = attachments;
		this.time = time;
	}
}