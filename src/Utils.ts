import fs from 'fs';

export class Utils {

    public constructor() {
        throw Error('This is a utility class and cannot be instantiated');
    }

    public static objectToFile(path: string, content: any): void {
        fs.writeFile(path, JSON.stringify(content), () => {
            console.log('Success update backup file...');
        });
        // fs.writeFileSync(path, JSON.stringify(content));
    }

    public static fileToObject(path: string): any {
        if (this.isFileExist(path)) {
            let data: Buffer = fs.readFileSync(path);
            return JSON.parse(data.toString());
        } else {
            console.error(`File ${path} not found`);
            return {};
        }
    }

    public static isFileExist(path: string): boolean {
        return fs.existsSync(path);
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