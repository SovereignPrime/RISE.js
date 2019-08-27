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

    async uploadAttachments() {
        this.attachments = await this.attachments.reduce(async (acc, path) => acc.concat(await this._rise.uploadPath(path))
            , [])
    }

    serialize() {
        this.data = YAML.stringify(this);
    }

    deserialyze() {
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
                cid = await this._rise.upload(payload),
                notification = this._notification.message(receiver, cid);

        });
    }

    static async receive(cid) {
        console.log(`Recieved message: ${cid}`);
        let msg = new Message(),
            payload = await this._rise.download(cid);
        msg.payload = payload[0].content.toString();
        console.log(msg.decrypt().deserialyze());
    }
}

module.exports = Message
