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

    async findByUrl(url: string): Promise<Article> {
        return this.articles.get(url);
    }

    async findAll(): Promise<Article[]> {
        return Array.from(this.articles.values());
    }

    async save(article: Article): Promise<Article> {
        const exists = await this.isExistByUrl(article.url);
        if (exists) {
            this.articles.set(article.url, article);
        } else {
            this.articles.set(article.url, article);
            if (this._articleListener) {
                this._articleListener.newArticle(article)
            }
        }
        return this.findByUrl(article.url);
    }

    async saveAll(articles: Article[]): Promise<Article[]> {
        const savedArticles: Article[] = [];
        for (const article of articles) {
            const exists = await this.isExistByUrl(article.url);
            if (!exists) {
                const saved = await this.save(article);
                savedArticles.push(saved);
            }
        }
        if (savedArticles && savedArticles.length > 0) {
            await this.saveToJsonFile();
        }
        return savedArticles;
    }

    async saveToJsonFile(): Promise<void> {
        const articles = await this.findAll();
        Utils.objectToFile(articleDbJsonPath, articles);
    }

    async findBySite(site: SiteType): Promise<Article[]> {
        const articles = await this.findAll();
        return articles.filter(value => value.site === site);
    }

    async findByParser(parserType: ParserType): Promise<Article[]> {
        const articles = await this.findAll();
        return articles.filter(value => value.parser === parserType);
    }

    async findByParserIn(parserTypes: ParserType[]): Promise<Article[]> {
        const articles = await this.findAll();
        return articles.filter(value => parserTypes.includes(value.parser));
    }

    async deleteByUrl(url: string): Promise<boolean> {
        return this.articles.delete(url);
    }

    async deleteByParserTypeIn(parserTypes: ParserType[]): Promise<void> {
        const articles: Article[] = await this.findByParserIn(parserTypes);
        for (const article of articles) {
            await this.deleteByUrl(article.url);
        }
        if (articles && articles.length > 0) {
            await this.saveToJsonFile();
        }
    }

    async isExistByUrl(url: string): Promise<boolean> {
        return this.articles.has(url);
    }

    /**
     * Get articles number per site
     */
    async getMapTypeCounts(): Promise<Map<SiteType, number>> {
        const map: Map<SiteType, number> = new Map<SiteType, number>();
        for (let siteType in SiteType) {
            let type = SiteType[siteType];
            const articles = await this.findBySite(type);
            map.set(type, articles.length);
        }
        return map;
    }

}