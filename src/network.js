'use strict'

const IPFS = require('ipfs');

class Rise {
    constructor() {
        this.repo = process.env.IPFS_PATH || process.env.HOME + '/.jsipfs';
        this.node = new IPFS({repo: this.repo, EXPERIMENTAL: {pubsub: true, ipnsPubsub: true}});
    }

    registerNotificationDispatcher(dispatcher) {
        //if (typeof(dispatcher) == function)
            this._notificationDispatcher = dispatcher;
    }

    publish(topic, msg) {
        this.node.pubsub.publish(topic, Buffer(msg), this.errorHandler);
    }

    subscribe(topic) {
        this.node.pubsub.subscribe(topic, (msg) =>
            this.subscriptionHandler(msg), {}, this.errorHandler);
    }

    subscriptionHandler(msg) {
        console.log(msg);
        if (this._notificationDispatcher) 
            this._notificationDispatcher(msg);
    }
    
    errorHandler(err) {
        console.log(err);
    }

    async id() {
        if (!this._cid) {
            let data = await this.node.id();
            this._cid = data.id;
        } 
        return this._cid;
    }

    async upload(payload) {
        let data = await this.node.add(Buffer(payload));
        return data[0].hash;
    }

    async uploadPath(payload) {
        let data = await this.node.addFromFs(payload);
        return data;
    }

    async download(cid) {
        let file = await this.node.get(cid);
        return file;
    }


}

const rise = new Rise();

module.exports = { Rise, rise };
