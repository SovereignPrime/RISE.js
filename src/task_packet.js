class TaskPacket {
	constructor(id, name, due, text, parent, status, involved, attachments, time, changes=[]){
		this.id = id;
		this.name = name;
		this.due = due;
		this.text = text;
		this.parent = parent;
		this.status = status;
		this.involved = involved;
		this.attachments = attachments;
		this.time = time;
		this.changes = changes;
	}
}