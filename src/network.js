'use strict'

const IPFS = require('ipfs-core');
const YAML = require('yaml');
const EventEmitter = require('events');

class Rise extends EventEmitter {
    constructor() {
        super();
        this.repo = process.env.IPFS_PATH || process.env.HOME + '/.jsipfs';
        IPFS.create({
            repo: this.repo,
            EXPERIMENTAL: {
                ipnsPubsub: true,
                sharding: false
            },
            config: {
                PubSub: {
                    Router: 'gossipsub',
                    Enabled: true 
                },
                Routing: {
                    Type: 'dht',
                },

            },
        }).then((node) => {
            this.node = node;
            this.emit('started');
        });
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
            return uint8ArrayConcat(chunks).toString().split('\n')
        } catch (err) {
            return [];
        }
    }

    async getObjects(base) {
        return await this.node.files.read('/' + base)
            .then((data) => YAML.parse(data.toString()))
            .catch((err) =>[]);
    }

    async getPublic(base) {
        return await this.node.files.read('/public/' + base)
            .then((data) => YAML.parse(data.toString()))
            .catch((err) => {});
    }

    async savePublic(base, object) {
        let data = YAML.stringify(object);
        await this.node.files.mkdir('/public', (_) => {});
        await this.node.files.write('/public/' + base, data, {create: true, truncate: true});
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
        let addrs = await this.node.dht.findPeer(cid);
        addrs.addrs.forEach((addr) => {
            console.log(addr.ip);
            this.node.swarm.connect(addr)
        });
    }
}

const rise = new Rise();

module.exports = { Rise, rise };
