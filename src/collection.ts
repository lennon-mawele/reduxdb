/// <reference path="db.ts" />

declare var require
const assign = require("object-assign")
const { get } = require("object-path")

module reduxdb {
    function values(o: Object): any[] {
        return Object.keys(o).map(k => o[k])
    }

    function newObjectID(): string {
        let hex = "0123456789abcdef"
        let id = []
        for (let i = 0; i < 24; i++) {
            let k = Math.floor(Math.random() * 16)
            id.push(hex.charAt(k))
        }
        return id.join("")
    }

    export class CollectionOption {
        index: string
    }

    export class Collection {
        private __db__: DB
        private __name__: string
        private __index__: string = "_id"
        private __data__: Object = {}

        constructor(db: DB, name: string, option: CollectionOption) {
            this.__db__ = db
            this.__name__ = name
            if (option) {
                if (option.index) this.__index__ = option.index
            }
        }

        copyTo(newCollection: string) {
            let result = this.__db__.createCollection(newCollection, {
                index: this.__index__
            })
            if (result["ok"] === 1) {
                let collection = this.__db__.getCollection(newCollection)
                assign(collection.__data__, this.__data__)
            }
        }

        count() {
            return Object.keys(this.__data__).length
        }

        // distinct(field: string) {}

        drop(): boolean {
            let db = this.__db__
            let name = this.__name__
            if (db.__collections__.get(name)) {
                db.__collections__.delete(name)
                delete db[name]
                return true
            } else {
                return false
            }
        }

        find(query?: Object): Object[] {
            let data = this.__data__
            if (query === undefined) {
                return values(data)
            } if (typeof query !== "object") {
                return []
            } else {
                let result = []
                values(data).forEach(v => {
                    let ok = true
                    Object.keys(query).forEach(k => {
                        if (get(v, k, undefined) !== query[k]) ok = false
                    })
                    if (ok) result.push(v)
                })
                return result
            }
        }

        findOne(query?: Object): Object {
            let result = this.find(query)
            return result.length === 0 ? null : result[0]
        }

        getDB() {
            return this.__db__
        }

        getFullName() {
            return this.__db__.getName() + "." + this.__name__
        }

        getIndexKeys() {
            let result = [{}]
            result[0][this.__index__] = 1
            return result
        }

        getName() {
            return this.__name__
        }

        insert(doc: Object) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "insert",
                doc: doc
            })
        }

        // mapReduce() {}

        remove(query: Object) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "remove",
                query: query
            })
        }

        renameCollection(newName: string) {
            let db = this.__db__
            if (db[newName]) {
                return {"ok": 0, "errmsg": "target namespace exists"}
            } else {
                db[newName] = this
                db.__collections__.set(newName, this)
                delete db[this.__name__]
                db.__collections__.delete(this.__name__)
                this.__name__ = newName
            }
        }

        save(doc: Object) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "save",
                doc: doc
            })
        }

        stats() {
            return {
                "ns" : this.getFullName(),
                "count" : this.count(),
                "ok" : 1
            }
        }

        update(query, doc, option) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "update",
                query: query,
                doc: doc,
                options: option
            })
        }

        __insert__(doc: Object): Object {
            let index = this.__index__
            let key = doc[index] || newObjectID()
            if (this.__data__[key]) {
                return {"nInserted": 0, "errmsg": "duplicate key"}
            } else {
                let result = assign({}, doc)
                result[index] = key
                this.__data__[key] = result
                return {"nInserted": 1}
            }
        }

        __remove__(query: Object): Object {
            let data = this.__data__
            if (query === undefined) {
                let result = {"nRemoved": this.count()}
                this.__data__ = {}
                return result
            } if (typeof query !== "object") {
                return {"nRemoved": 0}
            } else {
                let count = 0
                values(data).forEach((v, k) => {
                    let ok = true
                    Object.keys(query).forEach(k => {
                        if (get(v, k, undefined) !== query[k]) ok = false
                    })
                    if (ok) {
                        count += 1
                        delete data[k]
                    }
                })
                return {"nRemoved": count}
            }
        }

        __save__(doc: Object): Object {
            let index = this.__index__
            let result = assign({}, doc)
            if (!result[index]) result[index] = newObjectID()
            let key = result[index]
            this.__data__[key] = result
            return result
        }

        __update__(query: Object, doc: Object, option?: Object) {}
    }
}
