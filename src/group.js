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
        group.parent = this.id;
        group.save()
	}

	deleteSubgroup(group) {
        group.parent = undefined;
        group.save();
	}

}

module.exports = Group;
