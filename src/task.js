class Task {
	constructor(id, due, name, text="", parent, status=new, changes=[]){
		this.id = id;
		this.name = name;
		this.due = due;
		this.text = text;
		this.parent = parent;
		this.changes = changes;
		this.status = status;
	}
}