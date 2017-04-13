/// <reference path="collection.ts" />

module reduxdb {
    declare var global: any
    declare var require: any

    const redux = require("redux")

    export class Map<T> {
        private __map__: any = {}
        public size: number = 0

        forEach(callback: (value: T, key: string) => void) {
            Object.keys(this.__map__).forEach((key: string) => {
                let value: T = this.__map__[key]
                callback(value, key)
            })
        }

        has(key: string): boolean {
            return this.__map__[key] !== undefined
        }

        get(key: string): T {
            return this.__map__[key]
        }

        set(key: string, value: T) {
            this.__map__[key] = value
            this.size = Object.keys(this.__map__).length
        }

        delete(key: string) {
            delete this.__map__[key]
            this.size = Object.keys(this.__map__).length
        }
    }

    export interface ReduxStore {
        dispatch(e: any): any
        subscribe(f: any): any
    }

    export interface DB$ {
        [name: string]: Collection
    }

    export class DB {
        private __name__: string
        __collections__: Map<Collection> = new Map<Collection>()
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
            this.__store__ = redux.createStore(reducer, {}, global["devToolsExtension"] && global["devToolsExtension"]())
        }

        createCollection(name: string, options?: CollectionOptions): any {
            if (this.hasOwnProperty(name)) {
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

        subscribe(func: any): any {
            return this.__store__.subscribe(func)
        }
    }
}
