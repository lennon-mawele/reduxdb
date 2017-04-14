import * as chai from "chai"
import * as reduxdb from "../src/index"

const { deepEqual, notEqual } = chai.assert
const db = reduxdb.use("test")
const db$: reduxdb.DB$ = reduxdb.use("test") as any

deepEqual(db.createCollection("user"), { ok: 1 })
deepEqual(db.createCollection("user")["ok"], 0)

deepEqual(db.getCollection("user"), db$.user)
deepEqual(db.getCollection("team"), db$.team)
notEqual(db$.issue, db.getCollection("issue"))

deepEqual(db.getCollectionNames().sort(), ["issue", "team", "user"])

deepEqual(db.getName(), "test")

db$.issue.insert({})
db$.team.insert({})
db$.team.insert({})
db$.user.insert({})
db$.user.insert({})
db$.user.insert({})
deepEqual(db.stats(), {
    db: "test",
    collections: 3,
    objects: 6,
    ok: 1
})

let flag = false
db.subscribe(_ => flag = true)
db$.issue.find({})
deepEqual(flag, false)
deepEqual(db$.issue.count(), 1)
db$.issue.remove({})
deepEqual(flag, true)
deepEqual(db$.issue.count(), 0)