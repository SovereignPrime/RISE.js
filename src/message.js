'use strict'

const YAML = require('yaml');
const rise = require('./network').rise;

class Message {
	constructor(subject = "", body = {}, involved=[], attachments=[]){
        
		this.subject = subject;
		this.body = body;
		this.involved = involved;
        this.attachments = attachments;
		this.timestamp = new Date();
	}

    serialize() {
        this.data = YAML.stringify(this);
    }

    deserialize() {
        let struct = YAML.parse(this.data);
        return {...this, ...struct};
    }

    encrypt () {
        return this.data;
    }

    decrypt () {
        this.data = this.payload;
        return this
    }

    async send() {
        this.from = await rise.id();
        this.serialize()
        this.involved.map(async (receiver) => {
            let payload = this.encrypt(receiver);
            let cid = await rise.upload(payload);
            rise.publish(receiver, cid);
        });
    }

    static receive(cid) {
        let msg = this();
        msg.payload = rise.download(cid);
        return msg.decrypt().deserialyze()
    }
}

module.exports = Message
