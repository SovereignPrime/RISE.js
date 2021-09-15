'use strict'

const Serializable = require('./serializable');

class Contact extends Serializable {
    constructor(
        cid,
        name = "",
        nick = "",
        email = "",
        phone = "",
        address = "",
        avatar = "",
        groups = [],
        publicKey = ""
    ) {
        super();
        this.cid = cid;
        this.name = name;
        this.nick = nick
        this.email = email
        this.phone = phone;
        this.address = address;
        this.avatar = avatar
        this.groups = groups
        this.publicKey = publicKey;
    }

    static register(rise) {
        console.log('Register Contact');
        Contact._rise = rise;
    }

    static async me() {
        let vcard = await Contact._rise.getPublic("vcard");

        console.log('Vcard: ', vcard);
        if (!vcard || !vcard.cid) {
            return await Contact.bootstrap();
        } else {
            let me = new Contact(vcard.cid);
            return me.deserialyzeObj(vcard);
        }
    }

    static async bootstrap() {
        let cid = await Contact._rise.id(),
            me = new Contact(cid);
        console.log(`Bootstrapping vcard for ${cid}`);

        Contact._rise.savePublic("vcard", me);
        return me;
    }

    static async load(cid) {
        let myCid = await Contact._rise.id();
        if (cid == myCid) {
            return Contact.me();
        } else {
            let contacts = Contact._rise.getObjects("contacts"),
                contact = contacts.find((c) => c.cid == cid);
            if (contact == undefined) {
                contact = await Contact._rise.getIPNSObject(cid, 'vcard');
                await Contact._rise.saveObject('contacts', contact, 'cid');
            }
            return new Contact(cid).deserialyzeObj(contact);
        }
    }

    static async getByGroupId(gid=undefined) {
        let contacts = await Contact._rise.getObjects("contacts");
        if (gid == undefined)
            return contacts.map(c => new Contact(c.cid).deserialyzeObj(c));
        else
            return contacts.filter((c) => c.groups.indexOf(gid) >= 0);
    }

    addToGroup(group) {
        if (this.groups.indexOf(group.id) < 0)
            this.groups.push(group.id);
    }

    async save() {
        let myCid = await Contact._rise.id();
        if (this.cid == myCid)
            Contact._rise.savePublic("vcard", this);
        else
            await Contact._rise.saveObject('Contacts', this, 'cid');

    }
}

module.exports = Contact
