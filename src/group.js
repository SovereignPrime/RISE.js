class Group {
	constructor(id, name, subgroups) {
		this.name = name;
		this.id = id;
		this.subgroups = subgroups;
	}

	addSubgroup(group) {
		this.subgroups.push(group)
	}

	deleteSubgroup(group) {
		var index = this.subgroups.indexOf(group);
		if(index != -1){
		   this.subgroups.splice(index, 1);
		}
	}
}