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


    static message(receiver, cid) {
        let notification = new this({});
        notification.event = 'message';
        notification.value = cid;
        notification.receiver = receiver;
        return notification
    }

    serialyze() {
        return YAML.stringify({
            event: this.event, 
            data: this.value
        });
    }

    send(rise) {
        rise.publish(this.receiver, this.serialyze());
    }
}

class NotificationService {
    constructor(rise) {
        console.log('Register NotificationService as dispatcher');
        this._rise = rise;
        this.notifications = []
        rise.registerNotificationDispatcher(NotificationService.dispatcher);
    }

    static getService(rise) {
        if (!NotificationService._service) {
            NotificationService._service = new NotificationService(rise);
        }
        return NotificationService._service;
    }


    static dispatcher(msg) {
        let notification = new Notification(msg);
        NotificationService._service.dispatch(notification);
        return notification;
    }

    dispatch(notification) {
        switch (notification.event) {
            case 'message': 
                Message.receive(notification.value);
                break;

            case 'received':
                //Message.received(this.data);
                break;

            default:
                console.log(`Unknown notification event: ${this.event}`);
                break;
        }
    }

    message(receiver, cid) {
        let notification = Notification.message(receiver, cid);
        this.addNotification(notification);
    }

    addNotification(notification) {
        this.notifications.push(notification);
        this.notify();
    }

    notify() {
        this.notifications.forEach((notification) => {
            notification.send(this._rise)
        })
    }
}

module.exports = {
    Notification,
    NotificationService
}
