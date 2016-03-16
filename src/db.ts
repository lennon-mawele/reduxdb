/// <reference path="collection.ts" />

module reduxdb {
    export class DB {
        name: string
        collections: {}

        constructor(name:string) {
            this.name = name
        }

        createCollection(name:string):Object {
            if (this[name]) {
                return {"ok": 0, "errmsg": "collection already exists"}
            } else {
                this[name] = new Collection(this, name);
                this.collections[name] = this[name]
                return {"ok": 1}
            }
        }

        stats():Object {
            return {
                "db": this.name,
                "collections": Object.keys(this.collections).length,
                "objects": 31,     // TODO
                "ok": 1
            }
        }
    }
}
