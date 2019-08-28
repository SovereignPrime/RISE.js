'use strict'

const Message = require('./message');

class Update extends Message {
	constructor(to=null, subject="", text="", attachments=[]) {
        super(subject, {text: text}, [to], attachments);
		this.status = 'new';
        this.type = 'update';
	}

    static fromMessage(msg) {
        if (msg.type == 'update') {
            let upd = new Update();
            for (var k in msg) {
                upd[k] = msg[k]
            }
            return upd;
        } else {
            return msg;
        }
    }

    get text() {
        return this.body.text || ""
    }

    set text(val) {
        if (this.body) {
            this.body.text = val
        } else {
            this.body = {text: val}
        }
    }
}

module.exports = Update;
