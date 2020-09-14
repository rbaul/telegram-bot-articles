import fs from 'fs';
import {Article, ArticleType, ParserType} from './domain/model/Article';

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

    /**
     * Get articles number per parser
     */
    public static getMapParserTypeCounts(articles: Article[]): Map<ParserType, number> {
        const map: Map<ParserType, number> = new Map<ParserType, number>();
        for (let parserTypeKey in ParserType) {
            let type = ParserType[parserTypeKey];
            map.set(type, articles.filter(value => value.parser === type).length)
        }
        return map;
    }

    /**
     * Get articles number per type
     */
    public static getMapArticleTypeCounts(articles: Article[]): Map<ArticleType, number> {
        const map: Map<ArticleType, number> = new Map<ArticleType, number>();
        for (let articleTypeKey in ArticleType) {
            let type = ArticleType[articleTypeKey];
            map.set(type, articles.filter(value => value.types.includes(type)).length)
        }
        return map;
    }

    /**
     * Get all article parser types
     */
    public static getAllParserTypes(articles: Article[]): ParserType[] {
        let mapParserTypeCounts = this.getMapParserTypeCounts(articles);
        for (let parserTypeKey in ParserType) {
            const type = ParserType[parserTypeKey];
            const number = mapParserTypeCounts.get(type);
            if (number === 0) {
                mapParserTypeCounts.delete(type);
            }
        }
        return Array.from(mapParserTypeCounts.keys());
    }
}