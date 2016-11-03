/// <reference path="db.ts" />

declare var require
const assign = require("object-assign")
const { get } = require("object-path")

module reduxdb {
    export function values(o: Object): any[] {
        return Object.keys(o).map(k => o[k])
    }

    export function newObjectId(): string {
        let prefix: string = (global.location ? global.location.href.length : global.process.pid).toString(16)
        prefix = prefix.length < 2 ? ("0" + prefix) : prefix.substr(-2)
        let tsPart: string = Date.now().toString(16)
        tsPart = tsPart.length < 12 ? ("0" + tsPart) : tsPart.substr(-12)
        return prefix + tsPart + Math.floor(Math.random() * Math.pow(16, 10)).toString(16)
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

        constructor(db: DB, name: string, options?: CollectionOption) {
            this.__db__ = db
            this.__name__ = name
            if (options) {
                if (options.index) this.__index__ = options.index
            }
        }

        copyTo(newCollection: string): number {
            this.__db__.createCollection(newCollection, { index: this.__index__ })
            let collection = this.__db__.getCollection(newCollection)
            assign(collection.__data__, this.__data__)
            return this.count()
        }

        count(): number {
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

        getDB(): DB {
            return this.__db__
        }

        getFullName(): string {
            return this.__db__.getName() + "." + this.__name__
        }

        getIndexKeys(): Object[] {
            let result = [{}]
            result[0][this.__index__] = 1
            return result
        }

        getName(): string {
            return this.__name__
        }

        insert(doc: any): void {
            if (!doc) throw "no object passed to insert"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "insert",
                doc: doc
            })
        }

        // mapReduce() {}

        remove(query?: Object): void {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "remove",
                query: query
            })
        }

        renameCollection(newName: string): Object {
            let db = this.__db__
            if (db[newName]) {
                return { "ok": 0, "errmsg": "target namespace exists" }
            } else {
                db[newName] = this
                db.__collections__.set(newName, this)
                delete db[this.__name__]
                db.__collections__.delete(this.__name__)
                this.__name__ = newName
                return { "ok": 1 }
            }
        }

        save(doc: Object): void {
            if (!doc) throw "can't save a null"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "save",
                doc: doc
            })
        }

        stats(): Object {
            return {
                "ns": this.getFullName(),
                "count": this.count(),
                "ok": 1
            }
        }

        update(query: Object, doc: Object, options?: CollectionUpdateOption): void {
            if (!query) throw "need a query"
            if (!doc) throw "need an object"
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                type: "update",
                query: query,
                doc: doc,
                options: options
            })
        }

        __insert__(doc_: any): Object {
            let index = this.__index__
            let docs = []
            if (typeof doc_.length === "number") {
                docs = doc_
            } else {
                docs = [doc_]
            }

            let keySet = {}
            let result = null
            docs.forEach(doc => {
                let key = doc[index] || newObjectId()
                if (this.__data__[key] || keySet[key]) {
                    result = { "nInserted": 0, "errmsg": "duplicate key" }
                }
                keySet[key] = true
            })
            if (result) return result

            let count = 0
            docs.forEach(doc => {
                let key = doc[index] || newObjectId()
                let newDoc = assign({}, doc)
                newDoc[index] = key
                this.__data__[key] = newDoc
                count += 1
            })
            return { "nInserted": count }
        }

        __remove__(query: Object): Object {
            let data = this.__data__
            if (query === undefined) {
                let result = { "nRemoved": this.count() }
                this.__data__ = {}
                return result
            } if (typeof query !== "object") {
                return { "nRemoved": 0 }
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
                return { "nRemoved": count }
            }
        }

        __save__(doc: Object): Object {
            let index = this.__index__
            let result = assign({}, doc)
            if (!result[index]) result[index] = newObjectId()
            let key = result[index]
            this.__data__[key] = result
            return result
        }

        __update__(query: Object, doc: Object, options?: CollectionUpdateOption): Object {
            let upsert = false
            let multi = false
            if (options) {
                upsert = options.upsert || false
                multi = options.multi || false
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
                let key = doc[index] || newObjectId()
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
