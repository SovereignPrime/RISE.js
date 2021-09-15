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

    async save() {
        await this.constructor._rise.saveObject(this.constructor.name + 's', this, 'id');
    }
}

module.exports = Serializable
