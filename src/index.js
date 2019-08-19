'use strict'

const IPFS = require('ipfs');

export default class Rise {
    constructor() {
        this.node = IPFS();
        this.node.once('ready', () => {
            this.node.repo.stat(data => this.stats = data);
        });
    }
}
