'use strict'

const uuid = require('uuid');
const Serializable = require('./serializable');

class Group extends Serializable {
	constructor(name, parent = undefined) {
        super();
		this.name = name;
		this.id = uuid.v4();
		this.parent = parent;
	}

    static register(rise) {
        console.log('Register Group');
        Group._rise = rise;
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

    async save() {
        let myCid = await Group._rise.id();
        await Group._rise.saveObject('groups', this, 'id');

    }
}

module.exports = Group;
