import DB = require("./db")

class Collection {
    db: DB
    name: string

    constructor(db: DB, name: string) {
        this.db = db
        this.name = name
    }

    aggregate() {}

    clean() {}

    convertToCapped() {}

    convertToSingleObject() {}

    copyTo() {}

    count() {}

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

export = Collection