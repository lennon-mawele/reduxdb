"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux = require("redux");
var object_path_1 = require("object-path");
var Map = (function () {
    function Map() {
        this.__map__ = {};
        this.size = 0;
    }
    Map.prototype.forEach = function (callback) {
        var _this = this;
        Object.keys(this.__map__).forEach(function (key) {
            var value = _this.__map__[key];
            callback(value, key);
        });
    };
    Map.prototype.has = function (key) {
        return this.__map__[key] !== undefined;
    };
    Map.prototype.get = function (key) {
        return this.__map__[key];
    };
    Map.prototype.set = function (key, value) {
        this.__map__[key] = value;
        this.size = Object.keys(this.__map__).length;
    };
    Map.prototype.delete = function (key) {
        delete this.__map__[key];
        this.size = Object.keys(this.__map__).length;
    };
    return Map;
}());
exports.Map = Map;
function values(obj) {
    return Object.keys(obj).map(function (k) { return obj[k]; });
}
function newObjectId() {
    var prefix = (global.location ? global.location.href.length : global.process.pid).toString(16);
    prefix = prefix.length < 2 ? ("0" + prefix) : prefix.substr(-2);
    var tsPart = Date.now().toString(16);
    tsPart = tsPart.length < 12 ? ("0" + tsPart) : tsPart.substr(-12);
    var suffix = Math.floor(Math.random() * Math.pow(16, 10)).toString(16);
    while (suffix.length < 10)
        suffix = "0" + suffix;
    return prefix + tsPart + suffix;
}
exports.newObjectId = newObjectId;
var Collection = (function () {
    function Collection(db, name, options) {
        this.__index__ = "_id";
        this.__data__ = {};
        this.__db__ = db;
        this.__name__ = name;
        if (options) {
            if (options.index)
                this.__index__ = options.index;
        }
    }
    Collection.prototype.copyTo = function (newCollection) {
        this.__db__.createCollection(newCollection, { index: this.__index__ });
        var collection = this.__db__.getCollection(newCollection);
        collection.__data__ = __assign({}, collection.__data__, this.__data__);
        return this.count();
    };
    Collection.prototype.count = function () {
        return Object.keys(this.__data__).length;
    };
    Collection.prototype.drop = function () {
        var db = this.__db__;
        var name = this.__name__;
        if (db.__collections__.get(name)) {
            db.__collections__.delete(name);
            delete db[name];
            return true;
        }
        else {
            return false;
        }
    };
    Collection.prototype.find = function (query) {
        var data = this.__data__;
        if (query === undefined) {
            return values(data);
        }
        if (typeof query !== "object") {
            return [];
        }
        else {
            var result_1 = [];
            values(data).forEach(function (v) {
                var ok = true;
                Object.keys(query).forEach(function (k) {
                    if (object_path_1.get(v, k) !== query[k])
                        ok = false;
                });
                if (ok)
                    result_1.push(v);
            });
            return result_1;
        }
    };
    Collection.prototype.findOne = function (query) {
        var result = this.find(query);
        return result.length === 0 ? null : result[0];
    };
    Collection.prototype.getDB = function () {
        return this.__db__;
    };
    Collection.prototype.getFullName = function () {
        return this.__db__.getName() + "." + this.__name__;
    };
    Collection.prototype.getIndexKeys = function () {
        var result = [{}];
        result[0][this.__index__] = 1;
        return result;
    };
    Collection.prototype.getName = function () {
        return this.__name__;
    };
    Collection.prototype.insert = function (doc) {
        if (!doc)
            throw "no object passed to insert";
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "insert",
            doc: doc
        });
    };
    Collection.prototype.remove = function (query) {
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "remove",
            query: query
        });
    };
    Collection.prototype.renameCollection = function (newName) {
        var db = this.__db__;
        if (db[newName]) {
            return { "ok": 0, "errmsg": "target namespace exists" };
        }
        else {
            db[newName] = this;
            db.__collections__.set(newName, this);
            delete db[this.__name__];
            db.__collections__.delete(this.__name__);
            this.__name__ = newName;
            return { "ok": 1 };
        }
    };
    Collection.prototype.save = function (doc) {
        if (!doc)
            throw "can't save a null";
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "save",
            doc: doc
        });
    };
    Collection.prototype.stats = function () {
        return {
            "ns": this.getFullName(),
            "count": this.count(),
            "ok": 1
        };
    };
    Collection.prototype.update = function (query, doc, options) {
        if (!query)
            throw "need a query";
        if (!doc)
            throw "need an object";
        this.__db__.__store__.dispatch({
            ns: this.getFullName(),
            type: "update",
            query: query,
            doc: doc,
            options: options
        });
    };
    Collection.prototype.__insert__ = function (doc_) {
        var _this = this;
        var index = this.__index__;
        var docs = [];
        if (typeof doc_.length === "number") {
            docs = doc_;
        }
        else {
            docs = [doc_];
        }
        var keySet = {};
        var result = null;
        docs.forEach(function (doc) {
            var key = doc[index] || newObjectId();
            if (_this.__data__[key] || keySet[key]) {
                result = { "nInserted": 0, "errmsg": "duplicate key" };
            }
            keySet[key] = true;
        });
        if (result)
            return result;
        var count = 0;
        docs.forEach(function (doc) {
            var key = doc[index] || newObjectId();
            var newDoc = __assign({}, doc);
            newDoc[index] = key;
            _this.__data__[key] = newDoc;
            count += 1;
        });
        return { "nInserted": count };
    };
    Collection.prototype.__remove__ = function (query) {
        var _this = this;
        var data = this.__data__;
        if (query === undefined) {
            var result = { "nRemoved": this.count() };
            this.__data__ = {};
            return result;
        }
        if (typeof query !== "object") {
            return { "nRemoved": 0 };
        }
        else {
            var count_1 = 0;
            values(data).forEach(function (v) {
                var ok = true;
                Object.keys(query).forEach(function (k) {
                    if (object_path_1.get(v, k, undefined) !== query[k])
                        ok = false;
                });
                if (ok) {
                    count_1 += 1;
                    delete data[v[_this.__index__]];
                }
            });
            return { "nRemoved": count_1 };
        }
    };
    Collection.prototype.__save__ = function (doc) {
        var index = this.__index__;
        var result = __assign({}, doc);
        if (!result[index])
            result[index] = newObjectId();
        var key = result[index];
        this.__data__[key] = result;
        return result;
    };
    Collection.prototype.__update__ = function (query, doc, options) {
        var _this = this;
        var upsert = false;
        var multi = false;
        if (options) {
            upsert = options.upsert || false;
            multi = options.multi || false;
        }
        var nMatched = 0;
        var nUpserted = 0;
        var nModified = 0;
        var index = this.__index__;
        values(this.__data__).forEach(function (v) {
            var ok = true;
            Object.keys(query).forEach(function (k) {
                if (object_path_1.get(v, k, undefined) !== query[k])
                    ok = false;
            });
            if (ok) {
                if (multi || nModified < 1) {
                    var newDoc = __assign({}, doc);
                    newDoc[index] = v[index];
                    _this.__data__[v[index]] = newDoc;
                    nMatched += 1;
                    nModified += 1;
                }
            }
        });
        if (nModified === 0 && upsert) {
            var newDoc = __assign({}, doc);
            var key = doc[index] || newObjectId();
            newDoc[index] = key;
            this.__data__[key] = newDoc;
            nUpserted = 1;
        }
        return {
            "nMatched": nMatched,
            "nUpserted": nUpserted,
            "nModified": nModified
        };
    };
    return Collection;
}());
exports.Collection = Collection;
var DB = (function () {
    function DB(name) {
        var _this = this;
        this.__collections__ = new Map();
        this.__name__ = name;
        var reducer = redux.combineReducers({
            all: function (_, _a) {
                var ns = _a.ns, type = _a.type, query = _a.query, doc = _a.doc, options = _a.options;
                _this.__collections__.forEach(function (collection) {
                    if (collection.getFullName() === ns) {
                        switch (type) {
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
                                collection.__update__(query, doc, options);
                                break;
                            default:
                                break;
                        }
                    }
                });
                return _this.__collections__;
            }
        });
        this.__store__ = redux.createStore(reducer, {});
    }
    DB.prototype.createCollection = function (name, options) {
        if (this.hasOwnProperty(name)) {
            return { "ok": 0, "errmsg": "collection already exists" };
        }
        else {
            this[name] = new Collection(this, name, options);
            this.__collections__.set(name, this[name]);
            return { "ok": 1 };
        }
    };
    DB.prototype.getCollection = function (name) {
        if (!name)
            throw "Collection constructor called with undefined argument";
        this.createCollection(name);
        return this.__collections__.get(name);
    };
    DB.prototype.getCollectionNames = function () {
        var result = [];
        this.__collections__.forEach(function (_, k) { return result.push(k); });
        return result;
    };
    DB.prototype.getName = function () {
        return this.__name__;
    };
    DB.prototype.stats = function () {
        var objects = 0;
        this.__collections__.forEach(function (c) { return objects += c.count(); });
        return {
            "db": this.__name__,
            "collections": this.__collections__.size,
            "objects": objects,
            "ok": 1
        };
    };
    DB.prototype.subscribe = function (func) {
        return this.__store__.subscribe(func);
    };
    return DB;
}());
exports.DB = DB;
var dbs = new Map();
function use(name) {
    if (!dbs.has(name))
        dbs.set(name, new DB(name));
    return dbs.get(name);
}
exports.use = use;
