import * as redux from "redux"
import { Map, values, deepGet } from "./util"

declare const global: any

export function newObjectId(): string {
    let prefix: string = (
        global.location ? global.location.href.length : global.process.pid
    ).toString(16)
    prefix = prefix.length < 2 ? ("0" + prefix) : prefix.substr(-2)

    let tsPart: string = Date.now().toString(16)
    tsPart = tsPart.length < 12 ? ("0" + tsPart) : tsPart.substr(-12)

    let suffix = Math.floor(Math.random() * Math.pow(16, 10)).toString(16)
    while (suffix.length < 10) suffix = "0" + suffix

    return prefix + tsPart + suffix
}

export declare namespace Collection {
    interface Options {
        index?: string
    }

    interface UpdateOptions {
        upsert?: boolean
        multi?: boolean
    }
}

export class Collection {
    private __db__: DB
    private __name__: string
    private __index__: string = "_id"
    private __data__: any = {}

    constructor(db: DB, name: string, options?: Collection.Options) {
        this.__db__ = db
        this.__name__ = name
        if (options && options.index) this.__index__ = options.index
    }

    copyTo(newCollection: string): number {
        this.__db__.createCollection(newCollection, { index: this.__index__ })
        let collection: any = this.__db__.getCollection(newCollection)
        collection.__data__ = { ...collection.__data__, ...this.__data__ }
        return this.count()
    }

    count(): number {
        return Object.keys(this.__data__).length
    }

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

    find(query?: any): any[] {
        let data = this.__data__
        if (query === undefined) {
            return values(data)
        } if (typeof query !== "object") {
            return []
        } else {
            let result: any[] = []
            values(data).forEach(v => {
                let ok = true
                Object.keys(query).forEach(k => {
                    if (deepGet(v, k) !== query[k]) ok = false
                })
                if (ok) result.push(v)
            })
            return result
        }
    }

    findOne(query?: any): any {
        let result = this.find(query)
        return result.length === 0 ? null : result[0]
    }

    getDB(): DB {
        return this.__db__
    }

    getFullName(): string {
        return this.__db__.getName() + "." + this.__name__
    }

    getIndexKeys(): any[] {
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

    remove(query?: any): void {
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "remove",
            query: query
        })
    }

    renameCollection(newName: string): any {
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

    save(doc: any): void {
        if (!doc) throw "can't save a null"
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "save",
            doc: doc
        })
    }

    stats(): any {
        return {
            "ns": this.getFullName(),
            "count": this.count(),
            "ok": 1
        }
    }

    update(query: any, doc: any, options?: Collection.UpdateOptions): void {
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

    __insert__(doc_: any): any {
        let index = this.__index__
        let docs: any[] = []
        if (typeof doc_.length === "number") {
            docs = doc_
        } else {
            docs = [doc_]
        }

        let keySet = {}
        let result: any = null
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
            let newDoc = { ...doc }
            newDoc[index] = key
            this.__data__[key] = newDoc
            count += 1
        })
        return { "nInserted": count }
    }

    __remove__(query: any): any {
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
                    if (deepGet(v, k, undefined) !== query[k]) ok = false
                })
                if (ok) {
                    count += 1
                    delete data[v[this.__index__]]
                }
            })
            return { "nRemoved": count }
        }
    }

    __save__(doc: any): any {
        let index = this.__index__
        let result = { ...doc }
        if (!result[index]) result[index] = newObjectId()
        let key = result[index]
        this.__data__[key] = result
        return result
    }

    __update__(query: any, doc: any, options?: Collection.UpdateOptions): any {
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
                if (deepGet(v, k, undefined) !== query[k]) ok = false
            })
            if (ok) {
                if (multi || nModified < 1) {
                    let newDoc = { ...doc }
                    newDoc[index] = v[index]
                    this.__data__[v[index]] = newDoc
                    nMatched += 1
                    nModified += 1
                }
            }
        })
        if (nModified === 0 && upsert) {
            let newDoc = { ...doc }
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

export interface DB$ {
    [name: string]: Collection
}

export class DB {
    private __name__: string
    __collections__: Map<Collection> = new Map<Collection>()
    __store__: redux.Store<any>

    constructor(name: string) {
        this.__name__ = name
        let reducer = redux.combineReducers({
            all: (_, args: any) => {
                let { ns, type, query, doc, options } = args
                this.__collections__.forEach(collection => {
                    if (collection.getFullName() === ns) {
                        switch (type) {
                            case "insert":
                                collection.__insert__(doc)
                                break
                            case "remove":
                                collection.__remove__(query)
                                break
                            case "save":
                                collection.__save__(doc)
                                break
                            case "update":
                                collection.__update__(query, doc, options)
                                break
                            default:
                                break
                        }
                    }
                })
                return this.__collections__
            }
        })
        this.__store__ = redux.createStore(reducer, {})
    }

    createCollection(name: string, options?: Collection.Options): any {
        if (this.hasOwnProperty(name)) {
            return { "ok": 0, "errmsg": "collection already exists" }
        } else {
            this[name] = new Collection(this, name, options)
            this.__collections__.set(name, this[name])
            return { "ok": 1 }
        }
    }

    getCollection(name: string): Collection {
        if (!name) throw "Collection constructor called with undefined argument"
        this.createCollection(name)
        return this.__collections__.get(name) as Collection
    }

    getCollectionNames(): string[] {
        let result: string[] = []
        this.__collections__.forEach((_, k) => result.push(k))
        return result
    }

    getName(): string {
        return this.__name__
    }

    stats(): any {
        let objects = 0
        this.__collections__.forEach(c => objects += c.count())
        return {
            "db": this.__name__,
            "collections": this.__collections__.size,
            "objects": objects,
            "ok": 1
        }
    }

    subscribe(func: any, that?: any): any {
        let unsubscribe = this.__store__.subscribe(func)
        if (that) {
            that.__componentWillUnmount__ = that.componentWillUnmount || (_ => _)
            that.componentWillUnmount = () => {
                that.__componentWillUnmount__()
                unsubscribe()
            }
        }
        return unsubscribe
    }
}

const dbs: Map<DB> = new Map<DB>()

export function use(name: string): DB {
    if (!dbs.has(name)) dbs.set(name, new DB(name))
    return dbs.get(name) as DB
}

export function drop(name: string) {
    return dbs.delete(name)
}
