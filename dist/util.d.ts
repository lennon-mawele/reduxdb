/// <reference types="object-path" />
export declare const deepGet: {
    <T extends {}, TResult>(object: T, path: ObjectPathGlobal.IPath, defaultValue?: TResult | undefined): TResult;
    <T extends {}>(object: T): T;
    (): void;
};
export declare class Map<T> {
    private __map__;
    size: number;
    forEach(callback: (value: T, key: string) => void): void;
    has(key: string): boolean;
    get(key: string): T;
    set(key: string, value: T): void;
    delete(key: string): void;
}
export declare function values(obj: any): any[];
