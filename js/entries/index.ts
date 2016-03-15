import DB = require("../db")

let dbs = {}

export function use(name: string): DB {
    if (!dbs[name]) dbs[name] = new DB(name)
    return dbs[name]
}
