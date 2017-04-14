const { deepEqual, notEqual } = require("assert")
const reduxdb = require("../src/index")

describe("reduxdb", () => {
    beforeEach(() => {
        reduxdb.drop("test")
    })

    it("use", () => {
        let db = reduxdb.use("test")
        deepEqual(reduxdb.use("test"), db)
        notEqual(reduxdb.use("test"), undefined)
        notEqual(reduxdb.use("test"), null)
        notEqual(reduxdb.use("test"), reduxdb.use("other"))
    })

    it("drop", () => {
        let db = reduxdb.use("test")
        reduxdb.drop("test")
        notEqual(reduxdb.use("test"), db)
    })

    it("newObjectId", () => {
        deepEqual(reduxdb.newObjectId().length, 24)
    })
})
