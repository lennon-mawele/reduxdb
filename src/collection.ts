/// <reference path="db.ts" />

declare var require
const assign = require("object-assign")
const { get } = require("object-path")

module reduxdb {
    export function values(o: Object): any[] {
        return Object.keys(o).map(k => o[k])
    }

    export function newObjectID(): string {
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

    class CollectionUpdateOption {
        upsert: boolean = false
        multi: boolean = false
    }

    export class Collection {
        private __db__: DB
        private __name__: string
        private __index__: string = "_id"
        private __data__: Object = {}

        constructor(db: DB, name: string, option?: CollectionOption) {
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

        insert(doc: any) {
            if (!doc) throw "no object passed to insert"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "insert",
                doc: doc
            })
        }

        // mapReduce() {}

        remove(query?: Object) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "remove",
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
            if (!doc) throw "can't save a null"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "save",
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

        update(query: Object, doc: Object, option?: CollectionUpdateOption) {
            if (!query) throw "need a query"
            if (!doc) throw "need an object"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "update",
                query: query,
                doc: doc,
                options: option
            })
        }

        __insert__(doc_: any): Object {
            let index = this.__index__
            let docs = []
            if (!doc_.length) {
                docs = [doc_]
            } else {
                docs = doc_
            }

            let keySet = {}
            let result = null
            docs.forEach(doc => {
                let key = doc[index] || newObjectID()
                if (this.__data__[key] || keySet[key]) {
                    result = {"nInserted": 0, "errmsg": "duplicate key"}
                }
                keySet[key] = true
            })
            if (result) return result

            let count = 0
            docs.forEach(doc => {
                let key = doc[index] || newObjectID()
                let newDoc = assign({}, doc)
                newDoc[index] = key
                this.__data__[key] = newDoc
                count += 1
            })
            return {"nInserted": count}
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
                values(data).forEach(v => {
                    let ok = true
                    Object.keys(query).forEach(k => {
                        if (get(v, k, undefined) !== query[k]) ok = false
                    })
                    if (ok) {
                        count += 1
                        delete data[v[this.__index__]]
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

        __update__(query: Object, doc: Object, option?: CollectionUpdateOption) {
            let upsert = false
            let multi = false
            if (option) {
                upsert = option.upsert || false
                multi = option.multi || false
            }
            let nMatched = 0
            let nUpserted = 0
            let nModified = 0
            let index = this.__index__
            values(this.__data__).forEach(v => {
                let ok = true
                Object.keys(query).forEach(k => {
                    if (get(v, k, undefined) !== query[k]) ok = false
                })
                if (ok) {
                    if (multi || nModified < 1) {
                        let newDoc = assign({}, doc)
                        newDoc[index] = v[index]
                        this.__data__[v[index]] = newDoc
                        nMatched += 1
                        nModified += 1
                    }
                }
            })
            if (nModified === 0 && upsert) {
                let newDoc = assign({}, doc)
                let key = doc[index] || newObjectID()
                newDoc[index] = key
                this.__data__[key] = newDoc
                nUpserted = 1
            }
            return {
                "nMatched": nMatched,
                "nUpserted": nUpserted,
                "nModified": nModified
            }
        }
    }
}