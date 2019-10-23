'use strict'

const Serializable = require('./serializable');

class Message extends Serializable {
	constructor(subject = "", body = {}, involved=[], attachments=[]){
        super();
        
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

    static async getAll({start: start, count: count} = {}) {
        start = start || 0;
        count = count || 10;
        let message_ids = await Message._rise.getCIDs('messages'),
            messages = await Promise.all(message_ids.map(async (cid) => await Message.get(cid)));
        return await messages.slice(start, start + count);

    }

    async uploadAttachments() {
        this.attachments = await this.attachments.reduce(async (acc, path) => acc.concat(await this._rise.uploadPath(path))
            , [])
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
        //if (!this.involved.includes(this.from)) 
        //    this.involved.push(this.from);
        await this.uploadAttachments();
        this.serialize()
        this.involved.map(async (receiver) => {
            let payload = this.encrypt(receiver),
                cid = await this._rise.upload(payload);
            this._notification.message(receiver, cid);

        });
    }

    static async get(cid) {
        let msg = new Message(),
            payload = await Message._rise.download(cid);
        msg.payload = payload[0].content.toString();
        return msg.decrypt().deserialyze();
    }

    static async receive(from, cid) {
        console.log(`Recieved message from ${from} : ${cid}`);
        await Message._rise.pin(cid);
        await Message._rise.saveCID('messages', cid);
        Message._notification.received(from, cid);
    }
}

module.exports = Message
