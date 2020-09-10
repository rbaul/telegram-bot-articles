import {Article, ArticleType, SiteType} from '../domain/model/Article';
import {Repository} from '../domain/repositories/Repository';

const numberOfPagesForUpdate = 2;

export abstract class ArticleParser {

    repository: Repository<Article>;

    constructor(repository: Repository<Article>) {
        this.repository = repository;
    }

    abstract init(): Promise<void>[];

    updateArticles(): Promise<void>[] {
        return this.readArticles(numberOfPagesForUpdate);
    };

    getArticles(): Article[] {
        return this.repository.findAll();
    }

    abstract readArticlePage(pageNumber: number): Promise<void>;

    readArticles(numberOfPages: number): Promise<void>[] {
        const pagePromises: Promise<void>[] = [];
        for (let i = 1; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    createArticle(title: string, articleUrl: string, site: SiteType): Article {
        return {
            title: title,
            site: site,
            url: articleUrl,
            published: false,
            needPublish: true,
            type: ArticleType.SPRING
        };
    }

}