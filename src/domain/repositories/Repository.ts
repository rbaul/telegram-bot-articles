import {ParserType, SiteType} from '../model/Article';

/**
 * Repository interface
 */
export interface Repository<T> {
    findByUrl(url: string): Promise<T>;

    isExistByUrl(url: string): Promise<boolean>;

    findAll(): Promise<T[]>;

    save(t: T): Promise<T>;

    saveAll(t: T[]): Promise<T[]>;

    deleteByUrl(url: string): Promise<boolean>;

    findBySite(site: SiteType): Promise<T[]>;

    findByParser(parserType: ParserType): Promise<T[]>

    findByParserIn(parserTypes: ParserType[]): Promise<T[]>

    getMapTypeCounts(): Promise<Map<SiteType, number>>;

    deleteByParserTypeIn(parserTypes: ParserType[]): Promise<void>;

    saveToJsonFile(): Promise<void> | void;
}