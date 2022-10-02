const Item = require('./Item');

class ItemRequests {
    async getAll() {
        return await Item.find();
    }

    async deleteItemById(id) {
        return await Item.deleteOne({ _id: id });
    }

    async deleteItemByTitle(title) {
        return await Item.deleteOne({ title: title });
    }

    async getItemById(id) {
        const item = await Item.findById(id);
        if (!item) {
            throw new Error('No item found with that ID');
        } else {
            return item;
        }
    }

    async addItem(item) {
        Item.insertOne(item);
    }
}

module.exports = new ItemRequests()