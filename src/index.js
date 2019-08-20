'use strict'

const IPFS = require('ipfs');

class Rise {
    constructor() {
        this.node = new IPFS();
        this.node.once('ready', () => {
            this.node.repo.stat((err, data) => this.stats = data);
        });
    }
    async stat() {
        const stat = await this.node.repo.stat();
        return stat;

    }
}

module.exports = Rise;
