/// <reference path="db.ts" />

module reduxdb {
    let dbs = {}

    export function use(name: string): DB {
        if (!dbs[name]) dbs[name] = new DB(name)
        return dbs[name]
    }
}

declare var module
module.exports = reduxdb
