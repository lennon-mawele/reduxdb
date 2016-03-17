/// <reference path="collection.ts" />

declare var require
const redux = require("redux")
const Map = require("es6-map")

module reduxdb {
    interface ReduxStore {
        dispatch(e)
        subscribe(f)
    }

    interface Map<K, V> {
        delete(k)
        forEach(f)
        get(k)
        set(k, v)
        size()
    }

    export class DB {
        private __name__: string
        __collections__: Map<string, Collection> = new Map()
        __store__: ReduxStore

        constructor(name: string) {
            this.__name__= name
            let reducer = redux.combineReducers({
                all: (_, {ns, type, query, doc, options}) => {
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
            this.__store__ = redux.createStore(reducer)
        }

        createCollection(name: string, options?: CollectionOption): Object {
            if (this[name]) {
                return {"ok": 0, "errmsg": "collection already exists"}
            } else {
                this[name] = new Collection(this, name, options)
                this.__collections__.set(name, this[name])
                return {"ok": 1}
            }
        }

        getCollection(name: string): Collection {
            if (!name) throw "Collection constructor called with undefined argument"
            this.createCollection(name)
            return this.__collections__.get(name)
        }

        getCollectionNames(): string[] {
            let result = []
            this.__collections__.forEach((_, k) => result.push(k))
            return result
        }

        getName(): string {
            return this.__name__
        }

        stats(): Object {
            let objects = 0
            this.__collections__.forEach(c => objects += c.count())
            return {
                "db": this.__name__,
                "collections": this.__collections__.size,
                "objects": objects,
                "ok": 1
            }
        }

        subscribe(func: any): void {
            this.__store__.subscribe(func)
        }
    }
}
