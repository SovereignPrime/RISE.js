'use strict'

const IPFS = require('ipfs-http-client');
const YAML = require('yaml');
const uint8ArrayConcat = require('uint8arrays/concat');
const EventEmitter = require('events');

class Rise extends EventEmitter {
    constructor() {
        super();
        this.node = IPFS.create({port: 5002});
        this.emit('started');
    }

    registerNotificationDispatcher(dispatcher) {
        if (typeof(dispatcher) == 'function')
            this._notificationDispatcher = dispatcher;
    }

    publish(topic, msg) {
        this.node.pubsub.publish(topic, msg, this.errorHandler);
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
        let data = await this.node.add(payload);
        return data.cid.toString();
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
        let data = cids.join('\n');
        await this.node.files.write('/' + base, data, {create: true});
        return cids;
    }

    async getCIDs(base) {
        const chunks = [];

        try {
            for await (const chunk of this.node.files.read('/' + base)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks).toString().split('\n')
        } catch (err) {
            return [];
        }
    }

    async getObjects(base, def = []) {
        const chunks = [];
        try {
            for await (const chunk of this.node.files.read('/' + base)) {
                chunks.push(chunk);
            }
            return YAML.parse(Buffer.concat(chunks).toString());
        } catch (e) {
            console.log(e);
            return def;
        }
    }

    async getPublic(base) {
        return await this.getObjects(`public/${base}`, {});
    }

    async savePublic(base, object) {
        let data = YAML.stringify(object);
        try {
            await this.node.files.mkdir('/public');
        } finally {
            console.log(`Saving to '${base}'`);
            await this.node.files.write('/public/' + base, data, {create: true, truncate: true});
        }
    }

    async saveObjects(base, objects) {
        let data = YAML.stringify(objects);
        await this.node.files.write('/' + base, data, {create: true, truncate: true});
    }

    async saveObject(base, object, key = undefined) {
        let objects = await this.getObjects(base);
        if (key == undefined) {
            objects.push(object);
        } else {
            let index = objects.findIndex((o) => o[key] == object[key]);
            objects[index] = object;
        }
        await this.saveObjects(base, objects);
    }

    async getIPNSObject(cid, file) {
        let dir = await this.node.name.resolve(`/ipns/${cid}`),
            data = await this.node.cat(`${dir}/${file}`);
        return YAML.parse(data.toString());
    }

    started() {
        this.emit('ready');
    }

    async test(cid) {
        let k = new Uint8Array(cid),
            v = new Uint8Array("Hellow");

        for await (const r of this.node.dht.put(k, v)) {
            //console.log(r)
        }
        /* let addrs = await this.node.dht.findPeer(cid);
        addrs.addrs.forEach((addr) => {
            console.log(addr.ip);
            this.node.swarm.connect(addr)
        }); */
    }
}

const rise = new Rise();

module.exports = { Rise, rise };
