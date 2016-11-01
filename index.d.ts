declare namespace reduxdb {
    let use: (name: string) => ReduxDB;

    interface ReduxDB {
        createCollection(collectionName: string, indexConf: ReduxDBIndexConf): void;
        getCollection(name: string): ReduxDBCollection;
        getCollectionNames(): string[];
        getName(): string;
        stats(): {db: string, collections: number, objects: number, ok: number};
        subscribe(func: () => void): () => void;
        [propName: string]: any;
    }

    interface ReduxDBDocument {
        id?: string;
        [propName: string]: any;
    }

    interface ReduxDBIndexConf {
        index: string;
    }

    interface indexKeys {
        [propName: string]: number;
    }

    interface ReduxDBCollection {
        find(query?: any): ReduxDBDocument[];
        findOne(query?: any): ReduxDBDocument;
        copyTo(newCollection: string): number;
        count(): number;
        drop(): boolean;
        getDB(): ReduxDB;
        getFullName(): string;
        getIndexKeys(): indexKeys[];
        getName(): string;
        insert(doc: ReduxDBDocument): void;
        remove(query: any): void;
        renameCollection(newName: string): { ok: number, errmsg?: string };
        save(doc: ReduxDBDocument): void;
        stats(): {ns: string, count: number, ok: number};
        update(query:any, doc: ReduxDBDocument, option?: any): void;
    }
}

declare module "reduxdb"{
    export default reduxdb;
}
