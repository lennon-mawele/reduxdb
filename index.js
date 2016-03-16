/// <reference path="db.ts" />
const assign = require("object-assign");
const { get } = require("object-path");
var reduxdb;
(function (reduxdb) {
    function values(o) {
        return Object.keys(o).map(k => o[k]);
    }
    function newObjectID() {
        let hex = "0123456789abcdef";
        let id = [];
        for (let i = 0; i < 24; i++) {
            let k = Math.floor(Math.random() * 16);
            id.push(hex.charAt(k));
        }
        return id.join("");
    }
    class CollectionOption {
    }
    reduxdb.CollectionOption = CollectionOption;
    class Collection {
        constructor(db, name, option) {
            this.__index__ = "_id";
            this.__data__ = {};
            this.__db__ = db;
            this.__name__ = name;
            if (option) {
                if (option.index)
                    this.__index__ = option.index;
            }
        }
        copyTo(newCollection) {
            let result = this.__db__.createCollection(newCollection, {
                index: this.__index__
            });
            if (result["ok"] === 1) {
                let collection = this.__db__.getCollection(newCollection);
                assign(collection.__data__, this.__data__);
            }
        }
        count() {
            return Object.keys(this.__data__).length;
        }
        // distinct(field: string) {}
        drop() {
            let db = this.__db__;
            let name = this.__name__;
            if (db.__collections__.get(name)) {
                db.__collections__.delete(name);
                delete db[name];
                return true;
            }
            else {
                return false;
            }
        }
        find(query) {
            let data = this.__data__;
            if (query === undefined) {
                return values(data);
            }
            if (typeof query !== "object") {
                return [];
            }
            else {
                let result = [];
                values(data).forEach(v => {
                    let ok = true;
                    Object.keys(query).forEach(k => {
                        if (get(v, k, undefined) !== query[k])
                            ok = false;
                    });
                    if (ok)
                        result.push(v);
                });
                return result;
            }
        }
        findOne(query) {
            let result = this.find(query);
            return result.length === 0 ? null : result[0];
        }
        getDB() {
            return this.__db__;
        }
        getFullName() {
            return this.__db__.getName() + "." + this.__name__;
        }
        getIndexKeys() {
            let result = [{}];
            result[0][this.__index__] = 1;
            return result;
        }
        getName() {
            return this.__name__;
        }
        insert(doc) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "insert",
                doc: doc
            });
        }
        // mapReduce() {}
        remove(query) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "remove",
                query: query
            });
        }
        renameCollection(newName) {
            let db = this.__db__;
            if (db[newName]) {
                return { "ok": 0, "errmsg": "target namespace exists" };
            }
            else {
                db[newName] = this;
                db.__collections__.set(newName, this);
                delete db[this.__name__];
                db.__collections__.delete(this.__name__);
                this.__name__ = newName;
            }
        }
        save(doc) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "save",
                doc: doc
            });
        }
        stats() {
            return {
                "ns": this.getFullName(),
                "count": this.count(),
                "ok": 1
            };
        }
        update(query, doc, option) {
            this.__db__.__store__.dispatch({
                ns: this.getFullName(),
                action: "update",
                query: query,
                doc: doc,
                options: option
            });
        }
        __insert__(doc) {
            let index = this.__index__;
            let key = doc[index] || newObjectID();
            if (this.__data__[key]) {
                return { "nInserted": 0, "errmsg": "duplicate key" };
            }
            else {
                let result = assign({}, doc);
                result[index] = key;
                this.__data__[key] = result;
                return { "nInserted": 1 };
            }
        }
        __remove__(query) {
            let data = this.__data__;
            if (query === undefined) {
                let result = { "nRemoved": this.count() };
                this.__data__ = {};
                return result;
            }
            if (typeof query !== "object") {
                return { "nRemoved": 0 };
            }
            else {
                let count = 0;
                values(data).forEach((v, k) => {
                    let ok = true;
                    Object.keys(query).forEach(k => {
                        if (get(v, k, undefined) !== query[k])
                            ok = false;
                    });
                    if (ok) {
                        count += 1;
                        delete data[k];
                    }
                });
                return { "nRemoved": count };
            }
        }
        __save__(doc) {
            let index = this.__index__;
            let result = assign({}, doc);
            if (!result[index])
                result[index] = newObjectID();
            let key = result[index];
            this.__data__[key] = result;
            return result;
        }
        __update__(query, doc, option) { }
    }
    reduxdb.Collection = Collection;
})(reduxdb || (reduxdb = {}));
/// <reference path="redux.d.ts" />
/// <reference path="collection.ts" />
const redux = require("redux");
var reduxdb;
(function (reduxdb) {
    class DB {
        constructor(name) {
            this.__collections__ = new Map();
            this.__name__ = name;
            let reducer = redux.combineReducers({
                all: (_, { ns, action, query, doc, option }) => {
                    this.__collections__.forEach(collection => {
                        if (collection.getFullName() === ns) {
                            switch (action) {
                                case "insert":
                                    collection.__insert__(doc);
                                    break;
                                case "remove":
                                    collection.__remove__(query);
                                    break;
                                case "save":
                                    collection.__save__(doc);
                                    break;
                                case "update":
                                    collection.__update__(query, doc, option);
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                    return this.__collections__;
                }
            });
            this.__store__ = redux.createStore(reducer);
        }
        createCollection(name, option) {
            if (this[name]) {
                return { "ok": 0, "errmsg": "collection already exists" };
            }
            else {
                this[name] = new reduxdb.Collection(this, name, option);
                this.__collections__.set(name, this[name]);
                return { "ok": 1 };
            }
        }
        getCollection(name) {
            if (!name)
                throw "Error: collection constructor called with undefined argument";
            this.createCollection(name);
            return this.__collections__.get(name);
        }
        getCollectionNames() {
            let result = [];
            this.__collections__.forEach((_, k) => result.push(k));
            return result;
        }
        getName() {
            return this.__name__;
        }
        stats() {
            let objects = 0;
            this.__collections__.forEach(c => objects += c.count());
            return {
                "db": this.__name__,
                "collections": this.__collections__.size,
                "objects": objects,
                "ok": 1
            };
        }
        subscribe(func) {
            this.__store__.subscribe(func);
        }
    }
    reduxdb.DB = DB;
})(reduxdb || (reduxdb = {}));
/// <reference path="db.ts" />
var reduxdb;
(function (reduxdb) {
    let dbs = {};
    function use(name) {
        if (!dbs[name])
            dbs[name] = new reduxdb.DB(name);
        return dbs[name];
    }
    reduxdb.use = use;
})(reduxdb || (reduxdb = {}));
module.exports = reduxdb;
