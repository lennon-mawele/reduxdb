const { deepEqual, notEqual } = require("assert")
const reduxdb = require("../src/index")

describe("collection", () => {
    let db

    beforeEach(() => {
        reduxdb.drop("test")
        db = reduxdb.use("test")
        db.createCollection("user", { index: "id" })
        db.user.insert({ id: 1, name: "Buffon" })
        db.user.insert({ id: 2, name: "Pirlo" })
        db.user.insert({ id: 3, name: "Pogba" })
    })

    it("copyTo", () => {
        deepEqual(db.user.copyTo("visitor"), 3)
        deepEqual(db.visitor.count(), 3)
        deepEqual(db.visitor.findOne({ id: 1 }).name, "Buffon")
        deepEqual(db.visitor.findOne({ id: 2 }).name, "Pirlo")
        deepEqual(db.visitor.findOne({ id: 3 }).name, "Pogba")
        deepEqual(db.getCollection("empty").copyTo("user"), 0)
    })

    it("count", () => {
        deepEqual(db.user.count(), 3)
    })

    it("drop", () => {
        deepEqual(db.user.drop(), true)
        deepEqual(db.user, undefined)
        deepEqual(db.getCollection("user").count(), 0)
    })

    it("find", () => {
        deepEqual(db.user.find().map(u => u.id).sort(), [1, 2, 3])
        deepEqual(db.user.find({ id: 0 }), [])
        deepEqual(db.user.find({ id: 2 }), [{ id: 2, name: "Pirlo" }])
        deepEqual(db.user.find({ id: 2, name: "Pirlo" }), [{ id: 2, name: "Pirlo" }])
        deepEqual(db.user.find({ id: 3, name: "Pirlo" }), [])
    })

    it("insert", () => {
        db.user.insert({ id: 4, name: "Pogba" })
        deepEqual(db.user.find({ name: "Pogba" }).map(u => u.id).sort(), [3, 4])

        db.user.insert({ id: 3, name: "Dybala" })
        deepEqual(db.user.count(), 4)

        db.user.insert([])
        deepEqual(db.user.count(), 4)

        db.user.insert([{ id: 5, name: "Bonucci" }, { id: 6, name: "Barzagli" }])
        deepEqual(db.user.count(), 6)

        db.user.insert([{ id: 7, name: "PlayerA" }, { id: 7, name: "PlayerB" }])
        deepEqual(db.user.count(), 6)

        db.user.insert([{ id: 3, name: "PlayerA" }, { id: 7, name: "PlayerB" }])
        deepEqual(db.user.count(), 6)
    })

    it("findOne", () => {
        deepEqual(db.user.findOne({ id: 21, name: "Pirlo" }), null)
        deepEqual(db.user.findOne({ id: 2 }), { id: 2, name: "Pirlo" })
    })

    it("getDB", () => {
        deepEqual(db.user.getDB(), db)
    })

    it("getFullName", () => {
        deepEqual(db.user.getFullName(), "test.user")
    })

    it("getIndexKeys", () => {
        deepEqual(db.user.getIndexKeys(), [{ "id": 1 }])
        db.createCollection("visitor")
        deepEqual(db.visitor.getIndexKeys(), [{ "_id": 1 }])
    })

    it("getName", () => {
        deepEqual(db.user.getName(), "user")
    })

    it("remove", () => {
        db.user.remove({ name: "Pirlo" })
        deepEqual(db.user.count(), 2)
        db.user.remove()
        deepEqual(db.user.count(), 0)
    })

    it("renameCollection", () => {
        db.createCollection("visitor")
        deepEqual(db.user.renameCollection("visitor")["ok"], 0)
        deepEqual(db.user.renameCollection("account")["ok"], 1)
        deepEqual(db.account.count(), 3)
        deepEqual(db.account.getName(), "account")
        deepEqual(db.user, undefined)
        deepEqual(db.getCollection("user").count(), 0)
    })

    it("save", () => {
        db.user.save({ id: 4, name: "Dybala" })
        deepEqual(db.user.count(), 4)
        db.user.save({ id: 4, name: "Bonucci" })
        deepEqual(db.user.count(), 4)
        deepEqual(db.user.findOne({ id: 4 }).name, "Bonucci")
        db.user.save({ name: "Barzagli" })
        deepEqual(db.user.count(), 5)
        deepEqual(db.user.findOne({ name: "Barzagli" }).id.length, 24)
    })

    it("stats", () => {
        deepEqual(db.user.stats(), { ns: "test.user", count: 3, ok: 1 })
    })

    it("update", () => {
        db.user.update({ id: 4 }, { name: "Dybala" })
        deepEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3])
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Buffon", "Pirlo", "Pogba"])

        db.user.update({ id: 2, name: "Pirlo" }, { name: "Dybala", age: 21 })
        deepEqual(db.user.findOne({ id: 2 }), { id: 2, name: "Dybala", age: 21 })
        deepEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3])
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Buffon", "Dybala", "Pogba"])

        db.user.update({ id: 5 }, { name: "Bonucci" }, { upsert: true })
        deepEqual(db.user.findOne({ name: "Bonucci" }).id.length, 24)
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Bonucci", "Buffon", "Dybala", "Pogba"])

        let id = db.user.findOne({ name: "Bonucci" }).id
        db.user.update({ name: "Bonucci" }, { id: 5, name: "Barzagli" }, { upsert: true })
        deepEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3, id].sort())
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Pogba"])

        db.user.update({ id: null }, { id: 6, name: "Dybala" }, { upsert: true })
        deepEqual(db.user.findOne({ id: 6 }), { id: 6, name: "Dybala" })
        deepEqual(db.user.count(), 5)
        deepEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3, id, 6].sort())
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Dybala", "Pogba"])

        db.user.update({ name: "Dybala" }, { name: "Pirlo" })
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Pirlo", "Pogba"])

        db.user.update({}, { name: "Pirlo" }, { multi: true })
        deepEqual(db.user.find({}).map(u => u.name).sort(), ["Pirlo", "Pirlo", "Pirlo", "Pirlo", "Pirlo"])
    })
})
