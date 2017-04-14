import { get } from "object-path"

export const deepGet = get

export class Map<T> {
    private __map__: any = {}
    public size: number = 0

    forEach(callback: (value: T, key: string) => void) {
        Object.keys(this.__map__).forEach((key: string) => {
            let value: T = this.__map__[key]
            callback(value, key)
        })
    }

    has(key: string): boolean {
        return this.__map__[key] !== undefined
    }

    get(key: string): T {
        return this.__map__[key]
    }

    set(key: string, value: T) {
        this.__map__[key] = value
        this.size = Object.keys(this.__map__).length
    }

    delete(key: string) {
        delete this.__map__[key]
        this.size = Object.keys(this.__map__).length
    }
}

export function values(obj: any): any[] {
    return Object.keys(obj).map(k => obj[k])
}