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

    async getRandomItems(size) {
        let items = await Item.find();
        items.sort((a, b) => 0.5 - Math.random());
        while (items.length > size) {
            items.pop();
        }
        return items;
    }

    async addItem(item) {
        Item.insertOne(item);
    }
}

module.exports = new ItemRequests()