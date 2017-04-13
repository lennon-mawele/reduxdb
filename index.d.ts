declare module reduxdb {
    function values(o: any): any[];
    function newObjectId(): string;
    interface CollectionOptions {
        index?: string;
    }
    interface CollectionUpdateOptions {
        upsert?: boolean;
        multi?: boolean;
    }
    class Collection {
        private __db__;
        private __name__;
        private __index__;
        private __data__;
        constructor(db: DB, name: string, options?: CollectionOptions);
        copyTo(newCollection: string): number;
        count(): number;
        drop(): boolean;
        find(query?: any): any[];
        findOne(query?: any): any;
        getDB(): DB;
        getFullName(): string;
        getIndexKeys(): any[];
        getName(): string;
        insert(doc: any): void;
        remove(query?: any): void;
        renameCollection(newName: string): any;
        save(doc: any): void;
        stats(): any;
        update(query: any, doc: any, options?: CollectionUpdateOptions): void;
        __insert__(doc_: any): any;
        __remove__(query: any): any;
        __save__(doc: any): any;
        __update__(query: any, doc: any, options?: CollectionUpdateOptions): any;
    }
}
declare module reduxdb {
    class Map<T> {
        private __map__;
        size: number;
        forEach(callback: (value: T, key: string) => void): void;
        has(key: string): boolean;
        get(key: string): T;
        set(key: string, value: T): void;
        delete(key: string): void;
    }
    interface ReduxStore {
        dispatch(e: any): any;
        subscribe(f: any): any;
    }
    interface DB$ {
        [name: string]: Collection;
    }
    class DB {
        private __name__;
        __collections__: Map<Collection>;
        __store__: ReduxStore;
        constructor(name: string);
        createCollection(name: string, options?: CollectionOptions): any;
        getCollection(name: string): Collection;
        getCollectionNames(): string[];
        getName(): string;
        stats(): any;
        subscribe(func: any): any;
    }
}
declare module reduxdb {
    function use(name: string): DB;
}
declare var module: any;
