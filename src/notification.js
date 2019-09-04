'use strict'

const YAML = require('yaml');
const Message = require('./message');

class Notification {
    constructor({from: from, data: payload, topicIDs: topics} = {}) {
        if (from) {
            this.from = from;
            this.topics = topics;
            this.payload = payload.toString();
            this.yaml = YAML.parse(this.payload);
            this.event = this.yaml.event
            this.value = this.yaml.data
        }
    }


    static load({event: event, value: value, receiver: receiver}) {
        let notification = new Notification();
        notification.event = event;
        notification.value = value;
        notification.receiver = receiver;
        return notification
    }

    static message(receiver, cid) {
        let notification = new Notification({});
        notification.event = 'message';
        notification.value = cid;
        notification.receiver = receiver;
        return notification
    }

    static received(receiver, cid) {
        let notification = new Notification({});
        notification.event = 'received';
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
        console.log(`Sending Notification(${this.receiver}, ${this.event}, ${this.value}`);
        rise.publish(this.receiver, this.serialyze());
    }
}

class NotificationService {
    constructor(rise) {
        console.log('Register NotificationService as dispatcher');
        this._rise = rise;
        this._rise.getObjects('notifications')
            .then((d) => {
                this.notifications = d.map((n) => Notification.load(n));
            }).catch((_) => {
                this.notifications = [];
            });
        rise.registerNotificationDispatcher(NotificationService.dispatcher);
    }

    static getService(rise) {
        if (!NotificationService._service) {
            NotificationService._service = new NotificationService(rise);
            NotificationService._service.interval = setInterval(() => NotificationService._service.notify(), 20000);
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
                Message.receive(notification.from, notification.value);
                break;

            case 'received':
                this.removeNotification(notification.value);
                break;

            default:
                console.log(`Unknown notification event: ${notification.event}`);
                break;
        }
    }

    message(receiver, cid) {
        let notification = Notification.message(receiver, cid);
        this.addNotification(notification);
    }

    received(receiver, cid) {
        let notification = Notification.received(receiver, cid);
        notification.send(this._rise);
    }

    addNotification(notification) {
        this.notifications.push(notification);
        this.save();
        this.notify();
    }

    removeNotification(cid) {
        console.log(`Remove: ${cid}`);
        this.notifications = this.notifications.filter((notification) => notification.value != cid)
        this.save();

    }

    notify() {
        //console.log(`Notifications: ${this.notifications}`);
        this.notifications.forEach((notification) => {
            notification.send(this._rise)
        })
    }

    async save() {
        this._rise.saveObjects('notifications', this.notifications);
    }
}

module.exports = {
    Notification,
    NotificationService
}
