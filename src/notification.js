'use strict'

const YAML = require('yaml');
const Message = require('./message');

class Notification {
    constructor({from: from, data: payload, topicIDs: topics}) {
        if (from) {
            this.from = from;
            this.topics = topics;
            this.payload = payload.toString();
            this.yaml = YAML.parse(this.payload);
            this.event = this.yaml.event
            this.value = this.yaml.data
        }
    }

    static async register(rise) {
        console.log('Register Notification as dispatcher');
        rise.registerNotificationDispatcher(this.dispatcher);
    }

    static dispatcher(msg) {
        let notification = new Notification(msg);
        notification.dispatch();
        return notification;
    }

    dispatch() {
        switch (this.event) {
            case 'message': 
                Message.receive(this.value);
                break;

            case 'received':
                //Message.received(this.data);
                break;

            default:
                console.log(`Unknown notification event: ${this.event}`);
                break;
        }
    }

    static message(cid) {
        let notification = new this({});
        notification.event = 'message';
        notification.value = cid;
        return notification
    }

    serialyze() {
        return YAML.stringify({
            event: this.event, 
            data: this.value
        });
    }
}

module.exports = Notification
