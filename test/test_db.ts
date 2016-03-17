/// <reference path="assert.d.ts" />
import assert = require("assert")
const deepStrictEqual = assert.deepStrictEqual

declare var require
const reduxdb = require("../index.js")

let db = reduxdb.use("test")

deepStrictEqual(db.createCollection("user"), {ok: 1})
deepStrictEqual(db.createCollection("user")["ok"], 0)

deepStrictEqual(db.getCollection("user"), db.user)
deepStrictEqual(db.getCollection("team"), db.team)
assert.notEqual(db.issue, db.getCollection("issue"))

deepStrictEqual(db.getCollectionNames().sort(), ["issue", "team", "user"])

deepStrictEqual(db.getName(), "test")

db.issue.insert({})
db.team.insert({})
db.team.insert({})
db.user.insert({})
db.user.insert({})
db.user.insert({})
deepStrictEqual(db.stats(), {
    db: "test",
    collections: 3,
    objects: 6,
    ok: 1
})

let flag = false
db.subscribe(_ => flag = true)
db.issue.find({})
deepStrictEqual(flag, false)
deepStrictEqual(db.issue.count(), 1)
db.issue.remove({})
deepStrictEqual(flag, true)
deepStrictEqual(db.issue.count(), 0)