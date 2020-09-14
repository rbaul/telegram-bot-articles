import {ParserType, SiteType} from '../model/Article';

/**
 * Repository interface
 */
export interface Repository<T> {
    findByUrl(url: string): T;

    isExistByUrl(url: string): boolean;

    findAll(): T[];

    save(t: T): T;

    saveAll(t: T[]): T[];

    deleteByUrl(url: string): boolean;

    findBySite(site: SiteType): T[];

    findByParser(parserType: ParserType): T[]

    getMapTypeCounts(): Map<SiteType, number>;

    getMapParserTypeCounts(): Map<ParserType, number>;

    getAllParserTypes(): ParserType[];

}