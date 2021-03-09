'use strict'

const RISE = require('./network');
const Message = require('./message');
const Update = require('./update');
const Contact = require('./contact');
const {NotificationService} = require('./notification');

const rise = RISE.rise;

rise.once('started', async () => {
    let cid = await rise.id();
    let notification = NotificationService.getService(rise);
    Message.register(rise, notification);
    Contact.register(rise);
    rise.subscribe(cid);
    rise.started();
});

module.exports = { 
    Message, 
    Update,
    Contact,
    rise 
};
