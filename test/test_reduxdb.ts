/// <reference path="assert.d.ts" />
import assert = require("assert")

declare var require
const reduxdb = require("../index.js")

let db = reduxdb.use("test")
assert.deepStrictEqual(reduxdb.use("test"), db)
assert.notEqual(reduxdb.use("test"), undefined)
assert.notEqual(reduxdb.use("test"), null)
assert.notEqual(reduxdb.use("test"), reduxdb.use("other"))

assert.deepStrictEqual(reduxdb.values({a: 1, b: 2}).sort(), [1, 2])
assert.deepStrictEqual(reduxdb.newObjectId().length, 24)
