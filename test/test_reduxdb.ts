import * as chai from "chai"
import * as reduxdb from "../src/index"

const { deepEqual, notEqual } = chai.assert
const db = reduxdb.use("test")

deepEqual(reduxdb.use("test"), db)
notEqual(reduxdb.use("test"), undefined)
notEqual(reduxdb.use("test"), null)
notEqual(reduxdb.use("test"), reduxdb.use("other"))

deepEqual(reduxdb.newObjectId().length, 24)