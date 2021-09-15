'use strict'

const RISE = require('./network');
const Message = require('./message');
const Update = require('./update');
const Contact = require('./contact');
const Group = require('./group');
const {NotificationService} = require('./notification');

const rise = RISE.rise;

//rise.once('started', async () => {
rise.id().then((cid) => {
    console.log(`Started with id ${cid}`);
    let notification = NotificationService.getService(rise);
    Message.register(rise, notification);
    Contact.register(rise);
    Group.register(rise);
    rise.subscribe(cid);
    rise.started();
});

module.exports = { 
    Message, 
    Update,
    Contact,
    Group,
    rise 
};
