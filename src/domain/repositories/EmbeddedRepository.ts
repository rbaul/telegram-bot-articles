import {Repository} from './Repository';
import {Article, SiteType} from '../model/Article';
import {ArticleListener} from './ArticleListener';

/**
 * Embedded implementation of repository
 */
export class EmbeddedRepository implements Repository<Article> {

    private readonly articleListener: ArticleListener;

    constructor(articleListener?: ArticleListener) {
        this.articleListener = articleListener;
    }

    /**
     * Key - url
     * Value - Article
     */
    private articles: Map<string, Article> = new Map<string, Article>();

    findByUrl(url: string): Article {
        return this.articles.get(url);
    }

    findAll(): Article[] {
        return Array.from(this.articles.values());
    }

    save(article: Article): Article {
        this.articles.set(article.url, article);
        if (this.articleListener) {
            this.articleListener.newArticle(article)
        }
        // ArticleListener.getInstance().newArticle(article);
        return this.findByUrl(article.url);
    }

    findBySite(site: SiteType): Article[] {
        return this.findAll()
            .filter(value => value.site === site);
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
}