declare module "reduxdb"{
    interface DB {
        createCollection(collectionName: string, indexConf: IndexConf): void;
        getCollection(name: string): Collection;
        getCollectionNames(): string[];
        getName(): string;
        stats(): {db: string, collections: number, objects: number, ok: number};
        subscribe(func: () => void): () => void;
        [propName: string]: any;
    }

    interface Collection {
        find(query?: any): Document[];
        findOne(query?: any): Document;
        copyTo(newCollection: string): number;
        count(): number;
        drop(): boolean;
        getDB(): DB;
        getFullName(): string;
        getIndexKeys(): IndexKeys[];
        getName(): string;
        insert(doc: Document): void;
        remove(query: any): void;
        renameCollection(newName: string): { ok: number, errmsg?: string };
        save(doc: Document): void;
        stats(): {ns: string, count: number, ok: number};
        update(query:any, doc: Document, option?: any): void;
    }

    interface Document {
        [propName: string]: any;
    }

    interface IndexConf {
        index: string;
    }

    interface IndexKeys {
        [propName: string]: number;
    }

    namespace reduxdb {
        let use: (name: string) => DB;
        let DB: DB;
        let Collection: Collection;
    }

    export default reduxdb;
}
