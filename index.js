var assign = require("object-assign");
var get = require("object-path").get;
var reduxdb;
(function (reduxdb) {
    function values(o) {
        return Object.keys(o).map(function (k) { return o[k]; });
    }
    reduxdb.values = values;
    function newObjectId() {
        var hex = "0123456789abcdef";
        var id = [];
        for (var i = 0; i < 24; i++) {
            var k = Math.floor(Math.random() * 16);
            id.push(hex.charAt(k));
        }
        return id.join("");
    }
    reduxdb.newObjectId = newObjectId;
    var CollectionOption = (function () {
        function CollectionOption() {
        }
        return CollectionOption;
    }());
    reduxdb.CollectionOption = CollectionOption;
    var CollectionUpdateOption = (function () {
        function CollectionUpdateOption() {
            this.upsert = false;
            this.multi = false;
        }
        return CollectionUpdateOption;
    }());
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
            assign(collection.__data__, this.__data__);
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
                        if (get(v, k, undefined) !== query[k])
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
                var newDoc = assign({}, doc);
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
                        if (get(v, k, undefined) !== query[k])
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
            var result = assign({}, doc);
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
                    if (get(v, k, undefined) !== query[k])
                        ok = false;
                });
                if (ok) {
                    if (multi || nModified < 1) {
                        var newDoc = assign({}, doc);
                        newDoc[index] = v[index];
                        _this.__data__[v[index]] = newDoc;
                        nMatched += 1;
                        nModified += 1;
                    }
                }
            });
            if (nModified === 0 && upsert) {
                var newDoc = assign({}, doc);
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
    reduxdb.Collection = Collection;
})(reduxdb || (reduxdb = {}));
var redux = require("redux");
var Map = require("es6-map");
var reduxdb;
(function (reduxdb) {
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
            this.__store__ = redux.createStore(reducer);
        }
        DB.prototype.createCollection = function (name, options) {
            if (this[name]) {
                return { "ok": 0, "errmsg": "collection already exists" };
            }
            else {
                this[name] = new reduxdb.Collection(this, name, options);
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
    reduxdb.DB = DB;
})(reduxdb || (reduxdb = {}));
var reduxdb;
(function (reduxdb) {
    var dbs = {};
    function use(name) {
        if (!dbs[name])
            dbs[name] = new reduxdb.DB(name);
        return dbs[name];
    }
    reduxdb.use = use;
})(reduxdb || (reduxdb = {}));
module.exports = reduxdb;
