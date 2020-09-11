export class Utils {

    public constructor() {
        throw Error('This is a utility class and cannot be instantiated');
    }

    /**
     * Map => String
     */
    public static mapToString(map: Map<any, any>): string {
        return JSON.stringify(this.mapToObject(map));
    }

    /**
     * Map => Object
     */
    public static mapToObject(map: Map<any, any>): any {
        let object = {};
        for (let entry of map.entries()) {
            object[entry[0]] = entry[1];
        }
        return object;
    }
}