/// <reference path="collection.ts" />

module reduxdb {
    export class DB {
        private __name__: string
        private __collections__: Object = {}

        constructor(name: string) {
            this.__name__= name
        }

        createCollection(name: string, option?: CollectionOption): Object {
            if (this[name]) {
                return {"ok": 0, "errmsg": "collection already exists"}
            } else {
                this[name] = new Collection(this, name, option)
                this.__collections__[name] = this[name]
                return {"ok": 1}
            }
        }

        getCollection(name: string): Collection {
            if (!name) throw "Error: collection constructor called with undefined argument"
            this.createCollection(name)
            return this.__collections__[name]
        }

        getCollectionNames(): string[] {
            return Object.keys(this.__collections__)
        }

        getName(): string {
            return this.__name__
        }

        stats(): Object {
            let objects = 0
            Object.keys(this.__collections__).forEach(k =>
                objects += this.__collections__[k].count()
            )
            return {
                "db": this.__name__,
                "collections": Object.keys(this.__collections__).length,
                "objects": objects,
                "ok": 1
            }
        }
    }
}
