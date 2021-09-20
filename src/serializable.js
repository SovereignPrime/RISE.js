'use strict'

const YAML = require('yaml');

class Serializable {
    serialize() {
        this.data = YAML.stringify(this);
        return this.data;
    }

    deserialyze() {
        let struct = YAML.parse(this.data);
        return this.deserialyzeObj(struct);
    }

    deserialyzeObj(struct) {
        for (var k in struct) {
            this[k] = struct[k]
        }
        return this;
    }

    static async get(id) {
        let objs = await this.getAll();
        return objs.find(o => o.id == id);
    }

    static async getAll() {
        let objs = await this._rise.getObjects(this.name + "s");
        return objs.map(o => new this(o.id).deserialyzeObj(o));
    }

    async save() {
        await this.constructor._rise.saveObject(this.constructor.name + 's', this, 'id');
    }
}

module.exports = Serializable
