"use strict"

const assert = require("assert")
const reduxdb = require("../index.js")

let db = reduxdb.use("test")
assert.deepStrictEqual(reduxdb.use("test"), db)
assert.notEqual(reduxdb.use("test"), undefined)
assert.notEqual(reduxdb.use("test"), null)
assert.notEqual(reduxdb.use("test"), reduxdb.use("other"))

assert.deepStrictEqual(reduxdb.values({a: 1, b: 2}).sort(), [1, 2])
assert.deepStrictEqual(reduxdb.newObjectID().length, 24)

let check = {}
for (let i = 0; i < 16; i++) {
    reduxdb.newObjectID().split("").forEach(c => check[c] = true)
}
assert.deepStrictEqual(Object.keys(check).length, 16)
"0123456789abcdef".split("").forEach(c => {
    assert.deepStrictEqual(check[c], true)
})
