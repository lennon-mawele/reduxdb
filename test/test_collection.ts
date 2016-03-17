/// <reference path="assert.d.ts" />
import assert = require("assert")
const deepStrictEqual = assert.deepStrictEqual

declare var require
const reduxdb = require("../index.js")

function setup(db) {
    db.createCollection("user", {index: "id"})
    db.user.insert({id: 1, name: "Buffon"})
    db.user.insert({id: 2, name: "Pirlo"})
    db.user.insert({id: 3, name: "Pogba"})
}

let db = reduxdb.use("test")
setup(db)

deepStrictEqual(db.user.copyTo("visitor"), 3)
deepStrictEqual(db.visitor.count(), 3)
deepStrictEqual(db.visitor.findOne({id: 1}).name, "Buffon")
deepStrictEqual(db.visitor.findOne({id: 2}).name, "Pirlo")
deepStrictEqual(db.visitor.findOne({id: 3}).name, "Pogba")
deepStrictEqual(db.getCollection("empty").copyTo("user"), 0)

deepStrictEqual(db.user.count(), 3)

deepStrictEqual(db.visitor.drop(), true)
deepStrictEqual(db.visitor, undefined)
deepStrictEqual(db.getCollection("visitor").count(), 0)

deepStrictEqual(db.user.find().map(u => u.id).sort(), [1, 2, 3])
deepStrictEqual(db.user.find("id"), [])
deepStrictEqual(db.user.find({id: 2}), [{id: 2, name: "Pirlo"}])
deepStrictEqual(db.user.find({id: 2, name: "Pirlo"}), [{id: 2, name: "Pirlo"}])
deepStrictEqual(db.user.find({id: 3, name: "Pirlo"}), [])

db.user.insert({id: 4, name: "Pogba"})
deepStrictEqual(db.user.find({name: "Pogba"}).map(u => u.id).sort(), [3, 4])
deepStrictEqual([3, 4].indexOf(db.user.findOne({name: "Pogba"}).id) >= 0, true)

deepStrictEqual(db.user.findOne({id: 21, name: "Pirlo"}), null)

deepStrictEqual(db.user.getDB(), db)

deepStrictEqual(db.user.getFullName(), "test.user")

deepStrictEqual(db.user.getIndexKeys(), [{"id": 1}])
deepStrictEqual(db.getCollection("team").getIndexKeys(), [{"_id": 1}])

deepStrictEqual(db.user.getName(), "user")

db.user.drop()
setup(db)
deepStrictEqual(db.user.count(), 3)
db.user.insert({id: 3, name: "Dybala"})
deepStrictEqual(db.user.count(), 3)
db.user.insert({id: 4, name: "Dybala"})
deepStrictEqual(db.user.count(), 4)
db.user.insert([{id: 5, name: "Bonucci"}, {id: 5, name: "Barzagli"}])
deepStrictEqual(db.user.count(), 4)
db.user.insert([{id: 5, name: "Bonucci"}, {id: 3, name: "Barzagli"}])
deepStrictEqual(db.user.count(), 4)
db.user.insert([{id: 5, name: "Bonucci"}, {id: 6, name: "Barzagli"}])
deepStrictEqual(db.user.count(), 6)
db.user.insert({id: 21, name: "Pirlo"})
deepStrictEqual(db.user.count(), 7)

db.user.remove("id")
deepStrictEqual(db.user.count(), 7)
db.user.remove({name: "Pirlo"})
deepStrictEqual(db.user.count(), 5)
db.user.remove()
deepStrictEqual(db.user.count(), 0)

db.user.drop()
setup(db)
deepStrictEqual(db.user.renameCollection("team")["ok"], 0)
deepStrictEqual(db.user.renameCollection("account")["ok"], 1)
deepStrictEqual(db.account.count(), 3)
deepStrictEqual(db.account.getName(), "account")
deepStrictEqual(db.user, undefined)
deepStrictEqual(db.getCollection("user").count(), 0)

db.user.drop()
setup(db)
db.user.save({id: 4, name: "Dybala"})
deepStrictEqual(db.user.count(), 4)
db.user.save({id: 4, name: "Bonucci"})
deepStrictEqual(db.user.count(), 4)
deepStrictEqual(db.user.findOne({id: 4}).name, "Bonucci")
db.user.save({name: "Barzagli"})
deepStrictEqual(db.user.count(), 5)
deepStrictEqual(db.user.findOne({name: "Barzagli"}).id.length, 24)

deepStrictEqual(db.user.stats(), {ns: "test.user", count: 5, ok: 1})

db.user.drop()
setup(db)
deepStrictEqual(db.user.count(), 3)

db.user.update({id: 4}, {name: "Dybala"})
deepStrictEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3])
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Buffon", "Pirlo", "Pogba"])

db.user.update({id: 2, name: "Pirlo"}, {name: "Dybala", age: 21})
deepStrictEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3])
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Buffon", "Dybala", "Pogba"])
deepStrictEqual(db.user.findOne({id: 2}).age, 21)

db.user.update({id: 5}, {name: "Bonucci"}, {upsert: true})
deepStrictEqual(db.user.findOne({name: "Bonucci"}).id.length, 24)
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Bonucci", "Buffon", "Dybala", "Pogba"])
let id = db.user.findOne({name: "Bonucci"}).id
db.user.update({name: "Bonucci"}, {id: 5, name: "Barzagli"}, {upsert: true})
deepStrictEqual(db.user.find({}).map(u => u.id).sort(), [1, 2, 3, id].sort())
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Pogba"])

db.user.update({id: 6}, {id: 6, name: "Dybala"}, {upsert: true})
db.user.update({id: 7}, {id: 7, name: "Dybala"}, {upsert: true})
deepStrictEqual(db.user.count(), 6)
db.user.update({name: "Dybala"}, {name: "Pirlo"})
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Dybala", "Pirlo", "Pogba"])
db.user.update({name: "Dybala"}, {name: "Pirlo"}, {multi: true})
deepStrictEqual(db.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Pirlo", "Pirlo", "Pirlo", "Pogba"])

db.user.drop()
