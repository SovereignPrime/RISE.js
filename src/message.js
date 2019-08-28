'use strict'

const YAML = require('yaml');

class Message {
	constructor(subject = "", body = {}, involved=[], attachments=[]){
        
		this.subject = subject;
		this.body = body;
		this.involved = involved;
        this.attachments = attachments;
		this.timestamp = new Date();
	}

    static register(rise, notification) {
        console.log('Register message');
        this._rise = rise;
        this._notification = notification;
    }

    static getAll({start: start, count: count}) {
        start = start || 0;
        count = count || 10;
        let messages = [];
        for (var i=0; i<count;i++) {
            let subj = Math.random().toString(36).substring(2, 15),
                text = Math.random().toString(36).substring(2, 15),
                msg = new Message(subj, {text: text}, [subj]);
            msg.type='update';
            msg.status='new';
            messages.push(msg);
        }
        return messages;

    }

    async uploadAttachments() {
        this.attachments = await this.attachments.reduce(async (acc, path) => acc.concat(await this._rise.uploadPath(path))
            , [])
    }

    serialize() {
        this.data = YAML.stringify(this);
    }

    deserialyze() {
        let struct = YAML.parse(this.data);
        for (var k in struct) {
            this[k] = struct[k]
        }
        return this;
    }

    encrypt () {
        return this.data;
    }

    decrypt () {
        this.data = this.payload;
        return this
    }

    get _rise() {
        return this.constructor._rise;
    }

    get _notification() {
        return this.constructor._notification;
    }

    async send() {
        this.from = await this._rise.id();
        await this.uploadAttachments();
        this.serialize()
        this.involved.map(async (receiver) => {
            let payload = this.encrypt(receiver),
                cid = await this._rise.upload(payload);
            this._notification.message(receiver, cid);

        });
    }

    static async receive(cid) {
        console.log(`Recieved message: ${cid}`);
        let msg = new Message(),
            payload = await this._rise.download(cid);
        msg.payload = payload[0].content.toString();
        console.log(msg.decrypt().deserialyze());
        this._notification.received(msg.from, cid);
    }
}

module.exports = Message
