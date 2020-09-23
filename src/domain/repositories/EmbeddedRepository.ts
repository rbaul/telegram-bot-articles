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
            this.saveToJsonFile();
        }
        return savedArticles;
    }

    saveToJsonFile() {
        Utils.objectToFile(articleDbJsonPath, this.findAll());
    }

    findBySite(site: SiteType): Article[] {
        return this.findAll()
            .filter(value => value.site === site);
    }

    findByParser(parserType: ParserType): Article[] {
        return this.findAll()
            .filter(value => value.parser === parserType);
    }

    findByParserIn(parserTypes: ParserType[]): Article[] {
        return this.findAll()
            .filter(value => parserTypes.includes(value.parser));
    }

    deleteByUrl(url: string): boolean {
        return this.articles.delete(url);
    }

    deleteByParserTypeIn(parserTypes: ParserType[]): void {
        const articles: Article[] = this.findByParserIn(parserTypes);
        articles.forEach(article => this.deleteByUrl(article.url));
        if (articles && articles.length > 0) {
            this.saveToJsonFile();
        }
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

}