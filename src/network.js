'use strict'

const IPFS = require('ipfs');
const YAML = require('yaml');
const EventEmitter = require('events');

class Rise extends EventEmitter {
    constructor() {
        super();
        this.repo = process.env.IPFS_PATH || process.env.HOME + '/.jsipfs';
        this.node = new IPFS({repo: this.repo, EXPERIMENTAL: {pubsub: true, ipnsPubsub: true}});
    }

    registerNotificationDispatcher(dispatcher) {
        //if (typeof(dispatcher) == 'function')
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

    async pin(cid, recurcive = false) {
        return await this.node.pin.add(cid, {recurcive: recurcive});
    }

    async saveCID(base, cid) {
        let cids = await this.getCIDs(base);
        cids.push(cid);
        let data = Buffer(cids.join('\n'));
        await this.node.files.write('/' + base, data, {create: true});
        return cids;
    }

    async getCIDs(base) {
        return await this.node.files.read('/' + base)
            .then((data) => data.toString().split('\n'))
            .catch((err) =>[]);
    }

    async getObjects(base) {
        return await this.node.files.read('/' + base)
            .then((data) => YAML.parse(data.toString()))
            .catch((err) =>[]);
    }

    async saveObjects(base, objects) {
        let data = Buffer(YAML.stringify(objects));
        await this.node.files.write('/' + base, data, {create: true, truncate: true});
    }

    async saveObject(base, object) {
        let objects = await this.getObjects(base);
        objects.push(object);
        await this.saveObjects(base, objects);
    }

    started() {
        this.emit('ready');
    }

}

const rise = new Rise();

module.exports = { Rise, rise };
