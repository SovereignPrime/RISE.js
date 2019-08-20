class MessagePacket {
	constructor(subject, text, involved, attachments, time){
		this.subject = subject;
		this.text = text;
		this.involved = involved;
		this.attachments = attachments;
		this.time = time;
	}
}