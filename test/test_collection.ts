import * as chai from "chai"
import * as reduxdb from "../src/index"

const { deepEqual } = chai.assert

let objectId = reduxdb.newObjectId()
deepEqual(objectId.length, 24)

function setup(db) {
    db.createCollection("user", {index: "id"})
    db$.user.insert({id: 1, name: "Buffon"})
    db$.user.insert({id: 2, name: "Pirlo"})
    db$.user.insert({id: 3, name: "Pogba"})
}

let db: reduxdb.DB = reduxdb.use("test")
let db$: reduxdb.DB$ = reduxdb.use("test") as any
setup(db)

deepEqual(db$.user.copyTo("visitor"), 3)
deepEqual(db$.visitor.count(), 3)
deepEqual(db$.visitor.findOne({id: 1}).name, "Buffon")
deepEqual(db$.visitor.findOne({id: 2}).name, "Pirlo")
deepEqual(db$.visitor.findOne({id: 3}).name, "Pogba")
deepEqual(db.getCollection("empty").copyTo("user"), 0)

deepEqual(db$.user.count(), 3)

deepEqual(db$.visitor.drop(), true)
deepEqual(db$.visitor, undefined)
deepEqual(db.getCollection("visitor").count(), 0)

deepEqual(db$.user.find().map(u => u.id).sort(), [1, 2, 3])
deepEqual(db$.user.find("id"), [])
deepEqual(db$.user.find({id: 2}), [{id: 2, name: "Pirlo"}])
deepEqual(db$.user.find({id: 2, name: "Pirlo"}), [{id: 2, name: "Pirlo"}])
deepEqual(db$.user.find({id: 3, name: "Pirlo"}), [])

db$.user.insert({id: 4, name: "Pogba"})
deepEqual(db$.user.find({name: "Pogba"}).map(u => u.id).sort(), [3, 4])
deepEqual([3, 4].indexOf(db$.user.findOne({name: "Pogba"}).id) >= 0, true)

deepEqual(db$.user.findOne({id: 21, name: "Pirlo"}), null)

deepEqual(db$.user.getDB(), db)

deepEqual(db$.user.getFullName(), "test.user")

deepEqual(db$.user.getIndexKeys(), [{"id": 1}])
deepEqual(db.getCollection("team").getIndexKeys(), [{"_id": 1}])

deepEqual(db$.user.getName(), "user")

db$.user.drop()
setup(db)
deepEqual(db$.user.count(), 3)
db$.user.insert({id: 3, name: "Dybala"})
deepEqual(db$.user.count(), 3)
db$.user.insert({id: 4, name: "Dybala"})
deepEqual(db$.user.count(), 4)
db$.user.insert([{id: 5, name: "Bonucci"}, {id: 5, name: "Barzagli"}])
deepEqual(db$.user.count(), 4)
db$.user.insert([{id: 5, name: "Bonucci"}, {id: 3, name: "Barzagli"}])
deepEqual(db$.user.count(), 4)
db$.user.insert([{id: 5, name: "Bonucci"}, {id: 6, name: "Barzagli"}])
deepEqual(db$.user.count(), 6)
db$.user.insert({id: 21, name: "Pirlo"})
deepEqual(db$.user.count(), 7)

db$.user.remove("id")
deepEqual(db$.user.count(), 7)
db$.user.remove({name: "Pirlo"})
deepEqual(db$.user.count(), 5)
db$.user.remove()
deepEqual(db$.user.count(), 0)

db$.user.drop()
setup(db)
deepEqual(db$.user.renameCollection("team")["ok"], 0)
deepEqual(db$.user.renameCollection("account")["ok"], 1)
deepEqual(db$.account.count(), 3)
deepEqual(db$.account.getName(), "account")
deepEqual(db$.user, undefined)
deepEqual(db.getCollection("user").count(), 0)

db$.user.drop()
setup(db)
db$.user.save({id: 4, name: "Dybala"})
deepEqual(db$.user.count(), 4)
db$.user.save({id: 4, name: "Bonucci"})
deepEqual(db$.user.count(), 4)
deepEqual(db$.user.findOne({id: 4}).name, "Bonucci")
db$.user.save({name: "Barzagli"})
deepEqual(db$.user.count(), 5)
deepEqual(db$.user.findOne({name: "Barzagli"}).id.length, 24)

deepEqual(db$.user.stats(), {ns: "test.user", count: 5, ok: 1})

db$.user.drop()
setup(db)
deepEqual(db$.user.count(), 3)

db$.user.update({id: 4}, {name: "Dybala"})
deepEqual(db$.user.find({}).map(u => u.id).sort(), [1, 2, 3])
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Buffon", "Pirlo", "Pogba"])

db$.user.update({id: 2, name: "Pirlo"}, {name: "Dybala", age: 21})
deepEqual(db$.user.find({}).map(u => u.id).sort(), [1, 2, 3])
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Buffon", "Dybala", "Pogba"])
deepEqual(db$.user.findOne({id: 2}).age, 21)

db$.user.update({id: 5}, {name: "Bonucci"}, {upsert: true})
deepEqual(db$.user.findOne({name: "Bonucci"}).id.length, 24)
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Bonucci", "Buffon", "Dybala", "Pogba"])
let id = db$.user.findOne({name: "Bonucci"}).id
db$.user.update({name: "Bonucci"}, {id: 5, name: "Barzagli"}, {upsert: true})
deepEqual(db$.user.find({}).map(u => u.id).sort(), [1, 2, 3, id].sort())
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Pogba"])

db$.user.update({id: 6}, {id: 6, name: "Dybala"}, {upsert: true})
db$.user.update({id: 7}, {id: 7, name: "Dybala"}, {upsert: true})
deepEqual(db$.user.count(), 6)
db$.user.update({name: "Dybala"}, {name: "Pirlo"})
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Dybala", "Dybala", "Pirlo", "Pogba"])
db$.user.update({name: "Dybala"}, {name: "Pirlo"}, {multi: true})
deepEqual(db$.user.find({}).map(u => u.name).sort(), ["Barzagli", "Buffon", "Pirlo", "Pirlo", "Pirlo", "Pogba"])

db$.user.drop()
setup(db)
db$.user.insert([])
deepEqual(db$.user.count(), 3)

db$.user.drop()
