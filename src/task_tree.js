class TaskTree {
	constructor(task, parent, time, visible=false){
		this.task = task;
		this.parent = parent;
		this.time = time;
		this.visible = visible;
	}
}