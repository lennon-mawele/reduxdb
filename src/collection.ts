/// <reference path="db.ts" />

module reduxdb {
    export class CollectionOption {
        index: string
    }

    export class Collection {
        private __db__: DB
        private __name__: string
        private __index__: string = "_id"
        private __data__: Object = {}

        constructor(db: DB, name: string, option: CollectionOption) {
            this.__db__ = db
            this.__name__ = name
            if (option) {
                if (option.index) this.__index__ = option.index
            }
        }

        aggregate() {}

        clean() {}

        convertToCapped() {}

        convertToSingleObject() {}

        copyTo() {}

        count() {
            return Object.keys(this.__data__).length
        }

        createIndex() {}

        dataSize() {}

        diskStorageStats() {}

        distinct() {}

        drop() {}

        dropIndex() {}

        dropIndexes() {}

        ensureIndex() {}

        exists() {}

        find() {}

        findAndModify() {}

        findOne() {}

        getCollection() {}

        getDB() {}

        getDiskStorageStats() {}

        getFullName() {}

        getIndexKeys() {}

        getIndexSpecs() {}

        getIndexStats() {}

        getIndexes() {}

        getIndices() {}

        getMongo() {}

        getName() {}

        getPagesInRAM() {}

        getPlanCache() {}

        getQueryOptions() {}

        getShardDistribution() {}

        getShardVersion() {}

        getSlaveOk() {}

        getSplitKeysForChunks() {}

        getWriteConcern() {}

        group() {}

        groupcmd() {}

        hasOwnProperty() {}

        help() {}

        indexStats() {}

        initializeOrderedBulkOp() {}

        initializeUnorderedBulkOp() {}

        insert() {}

        isCapped() {}

        mapReduce() {}

        pagesInRAM() {}

        propertyIsEnumerable() {}

        reIndex() {}

        remove() {}

        renameCollection() {}

        runCommand() {}

        save() {}

        setSlaveOk() {}

        setWriteConcern() {}

        shellPrint() {}

        stats() {}

        storageSize() {}

        toLocaleString() {}

        toString() {}

        tojson() {}

        totalIndexSize() {}

        totalSize() {}

        unsetWriteConcern() {}

        update() {}

        validate() {}

        valueOf() {}

        verify() {}
    }
}
