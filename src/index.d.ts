import * as redux from "redux";
export declare class Map<T> {
    private __map__;
    size: number;
    forEach(callback: (value: T, key: string) => void): void;
    has(key: string): boolean;
    get(key: string): T;
    set(key: string, value: T): void;
    delete(key: string): void;
}
export declare function newObjectId(): string;
export interface CollectionOptions {
    index?: string;
}
export interface CollectionUpdateOptions {
    upsert?: boolean;
    multi?: boolean;
}
export declare class Collection {
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
export interface DB$ {
    [name: string]: Collection;
}
export declare class DB {
    private __name__;
    __collections__: Map<Collection>;
    __store__: redux.Store<any>;
    constructor(name: string);
    createCollection(name: string, options?: CollectionOptions): any;
    getCollection(name: string): Collection;
    getCollectionNames(): string[];
    getName(): string;
    stats(): any;
    subscribe(func: any): any;
}
export declare function use(name: string): DB;
