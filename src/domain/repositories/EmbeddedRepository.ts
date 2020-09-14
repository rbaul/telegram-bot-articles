import {Repository} from './Repository';
import {Article, ParserType, SiteType} from '../model/Article';
import {ArticleListener} from './ArticleListener';
import {Utils} from '../../Utils';
import {articleDbJsonPath} from '../../app';

/**
 * Embedded implementation of repository
 */
export class EmbeddedRepository implements Repository<Article> {

    private _articleListener: ArticleListener;

    constructor(articleListener?: ArticleListener) {
        this._articleListener = articleListener;
    }

    /**
     * Key - url
     * Value - Article
     */
    private articles: Map<string, Article> = new Map<string, Article>();

    set articleListener(value: ArticleListener) {
        this._articleListener = value;
    }

    findByUrl(url: string): Article {
        return this.articles.get(url);
    }

    findAll(): Article[] {
        return Array.from(this.articles.values());
    }

    save(article: Article): Article {
        if (this.isExistByUrl(article.url)) {
            this.articles.set(article.url, article);
        } else {
            this.articles.set(article.url, article);
            if (this._articleListener) {
                this._articleListener.newArticle(article)
            }
        }
        return this.findByUrl(article.url);
    }

    saveAll(articles: Article[]): Article[] {
        const savedArticles = articles.filter(article => !this.isExistByUrl(article.url))
            .map(article => this.save(article));
        if (savedArticles && savedArticles.length > 0) { // Update DB json file for backup
            Utils.objectToFile(articleDbJsonPath, this.findAll());
        }
        return savedArticles;
    }

    findBySite(site: SiteType): Article[] {
        return this.findAll()
            .filter(value => value.site === site);
    }

    findByParser(parserType: ParserType): Article[] {
        return this.findAll()
            .filter(value => value.parser === parserType);
    }

    deleteByUrl(url: string): boolean {
        return this.articles.delete(url);
    }

    isExistByUrl(url: string): boolean {
        return this.articles.has(url);
    }

    /**
     * Get articles number per site
     */
    getMapTypeCounts(): Map<SiteType, number> {
        const map: Map<SiteType, number> = new Map<SiteType, number>();
        for (let siteType in SiteType) {
            let type = SiteType[siteType];
            map.set(type, this.findBySite(type).length)
        }
        return map;
    }

    /**
     * Get articles number per parser
     */
    getMapParserTypeCounts(): Map<ParserType, number> {
        const map: Map<ParserType, number> = new Map<ParserType, number>();
        for (let parserTypeKey in ParserType) {
            let type = ParserType[parserTypeKey];
            map.set(type, this.findByParser(type).length)
        }
        return map;
    }

    /**
     * Get all article parser types
     */
    getAllParserTypes(): ParserType[] {
        let mapParserTypeCounts = this.getMapParserTypeCounts();
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