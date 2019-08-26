'use strict'

const IPFS = require('ipfs');

class Rise {
    constructor() {
        this.node = new IPFS({EXPERIMENTAL: {pubsub: true, ipnsPubsub: true}});
    }

    subscribe(topic) {
        this.node.pubsub.subscribe(topic, this.subscriptionHandler, {}, this.errorHandler);
    }

    subscriptionHandler(msg) {
        console.log(msg);
    }
    
    errorHandler(err) {
        console.log(err);
    }

    async id() {
        let data = await this.node.id();
        return data.id;
    }

    async upload(payload) {
        let data = await this.node.add(Buffer(payload));
        return data[0].hash;
    }

    publish(topic, msg) {
        this.node.pubsub.publish(topic, Buffer(msg), this.errorHandler);
    }
}

const rise = new Rise();

module.exports = { Rise, rise };
