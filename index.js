/// <reference path="db.ts" />
var reduxdb;
(function (reduxdb) {
    var Collection = (function () {
        function Collection(db, name) {
            this.db = db;
            this.name = name;
        }
        Collection.prototype.aggregate = function () { };
        Collection.prototype.clean = function () { };
        Collection.prototype.convertToCapped = function () { };
        Collection.prototype.convertToSingleObject = function () { };
        Collection.prototype.copyTo = function () { };
        Collection.prototype.count = function () { };
        Collection.prototype.createIndex = function () { };
        Collection.prototype.dataSize = function () { };
        Collection.prototype.diskStorageStats = function () { };
        Collection.prototype.distinct = function () { };
        Collection.prototype.drop = function () { };
        Collection.prototype.dropIndex = function () { };
        Collection.prototype.dropIndexes = function () { };
        Collection.prototype.ensureIndex = function () { };
        Collection.prototype.exists = function () { };
        Collection.prototype.find = function () { };
        Collection.prototype.findAndModify = function () { };
        Collection.prototype.findOne = function () { };
        Collection.prototype.getCollection = function () { };
        Collection.prototype.getDB = function () { };
        Collection.prototype.getDiskStorageStats = function () { };
        Collection.prototype.getFullName = function () { };
        Collection.prototype.getIndexKeys = function () { };
        Collection.prototype.getIndexSpecs = function () { };
        Collection.prototype.getIndexStats = function () { };
        Collection.prototype.getIndexes = function () { };
        Collection.prototype.getIndices = function () { };
        Collection.prototype.getMongo = function () { };
        Collection.prototype.getName = function () { };
        Collection.prototype.getPagesInRAM = function () { };
        Collection.prototype.getPlanCache = function () { };
        Collection.prototype.getQueryOptions = function () { };
        Collection.prototype.getShardDistribution = function () { };
        Collection.prototype.getShardVersion = function () { };
        Collection.prototype.getSlaveOk = function () { };
        Collection.prototype.getSplitKeysForChunks = function () { };
        Collection.prototype.getWriteConcern = function () { };
        Collection.prototype.group = function () { };
        Collection.prototype.groupcmd = function () { };
        Collection.prototype.hasOwnProperty = function () { };
        Collection.prototype.help = function () { };
        Collection.prototype.indexStats = function () { };
        Collection.prototype.initializeOrderedBulkOp = function () { };
        Collection.prototype.initializeUnorderedBulkOp = function () { };
        Collection.prototype.insert = function () { };
        Collection.prototype.isCapped = function () { };
        Collection.prototype.mapReduce = function () { };
        Collection.prototype.pagesInRAM = function () { };
        Collection.prototype.propertyIsEnumerable = function () { };
        Collection.prototype.reIndex = function () { };
        Collection.prototype.remove = function () { };
        Collection.prototype.renameCollection = function () { };
        Collection.prototype.runCommand = function () { };
        Collection.prototype.save = function () { };
        Collection.prototype.setSlaveOk = function () { };
        Collection.prototype.setWriteConcern = function () { };
        Collection.prototype.shellPrint = function () { };
        Collection.prototype.stats = function () { };
        Collection.prototype.storageSize = function () { };
        Collection.prototype.toLocaleString = function () { };
        Collection.prototype.toString = function () { };
        Collection.prototype.tojson = function () { };
        Collection.prototype.totalIndexSize = function () { };
        Collection.prototype.totalSize = function () { };
        Collection.prototype.unsetWriteConcern = function () { };
        Collection.prototype.update = function () { };
        Collection.prototype.validate = function () { };
        Collection.prototype.valueOf = function () { };
        Collection.prototype.verify = function () { };
        return Collection;
    }());
    reduxdb.Collection = Collection;
})(reduxdb || (reduxdb = {}));
/// <reference path="collection.ts" />
var reduxdb;
(function (reduxdb) {
    var DB = (function () {
        function DB(name) {
            this.name = name;
        }
        DB.prototype.createCollection = function (name) {
            if (this[name]) {
                return { "ok": 0, "errmsg": "collection already exists" };
            }
            else {
                this[name] = new reduxdb.Collection(this, name);
                this.collections[name] = this[name];
                return { "ok": 1 };
            }
        };
        DB.prototype.stats = function () {
            return {
                "db": this.name,
                "collections": Object.keys(this.collections).length,
                "objects": 31,
                "ok": 1
            };
        };
        return DB;
    }());
    reduxdb.DB = DB;
})(reduxdb || (reduxdb = {}));
/// <reference path="db.ts" />
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
