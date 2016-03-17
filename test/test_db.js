"use strict"

const assert = require("assert")
const reduxdb = require("../index.js")

let db = reduxdb.use("test")

assert.deepStrictEqual(db.createCollection("user"), {ok: 1})
assert.deepStrictEqual(db.createCollection("user")["ok"], 0)

assert.deepStrictEqual(db.getCollection("user"), db.user)
assert.deepStrictEqual(db.getCollection("team"), db.team)
assert.notEqual(db.issue, db.getCollection("issue"))

assert.deepStrictEqual(db.getCollectionNames().sort(), ["issue", "team", "user"])

assert.deepStrictEqual(db.getName(), "test")


db.issue.insert({})
db.team.insert({})
db.team.insert({})
db.user.insert({})
db.user.insert({})
db.user.insert({})
assert.deepStrictEqual(db.stats(), {
    db: "test",
    collections: 3,
    objects: 6,
    ok: 1
})

let flag = false
db.subscribe(_ => flag = true)
db.issue.find({})
assert.deepStrictEqual(flag, false)
assert.deepStrictEqual(db.issue.count(), 1)
db.issue.remove({})
assert.deepStrictEqual(flag, true)
assert.deepStrictEqual(db.issue.count(), 0)