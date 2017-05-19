const { deepEqual, notEqual } = require("assert")
const reduxdb = require("../dist/index")

describe("db", () => {
    let db

    beforeEach(() => {
        reduxdb.drop("test")
        db = reduxdb.use("test")
    })

    it("createCollection", () => {
        deepEqual(db.createCollection("user"), { ok: 1 })
        deepEqual(db.createCollection("user")["ok"], 0)
    })

    it("getCollection", () => {
        db.createCollection("user")
        deepEqual(db.getCollection("user"), db.user)
    })

    it("getCollectionNames", () => {
        db.createCollection("user")
        db.createCollection("team")
        db.createCollection("issue")
        deepEqual(db.getCollectionNames().sort(), ["issue", "team", "user"])
    })

    it("getName", () => {
        deepEqual(db.getName(), "test")
    })

    it("stats", () => {
        db.createCollection("user")
        db.createCollection("team")
        db.user.insert({})
        db.user.insert({})
        db.user.insert({})
        db.team.insert({})
        db.team.insert({})
        deepEqual(db.stats(), {
            db: "test",
            collections: 2,
            objects: 5,
            ok: 1
        })
    })

    it("subscribe", () => {
        let flag = false
        db.createCollection("issue")
        db.subscribe(() => flag = true)
        deepEqual(flag, false)
        db.issue.remove({})
        deepEqual(flag, true)
    })
})
