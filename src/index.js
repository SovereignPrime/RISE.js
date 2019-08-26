'use strict'

const RISE = require('./network');
const Message = require('./message');
const Notification = require('./notification');
const rise = RISE.rise;
rise.node.once('ready', async () => {
    let cid = await rise.id();
    Notification.register(rise);
    Message.register(rise, Notification);
    rise.subscribe(cid);
});

module.exports = { 
    Message, 
    rise 
};
