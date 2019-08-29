'use strict'

const RISE = require('./network');
const Message = require('./message');
const Update = require('./update');
const {NotificationService} = require('./notification');

const rise = RISE.rise;

rise.node.once('ready', async () => {
    let cid = await rise.id();
    let notification = NotificationService.getService(rise);
    Message.register(rise, notification);
    rise.subscribe(cid);
    rise.started();
});

module.exports = { 
    Message, 
    Update,
    rise 
};
