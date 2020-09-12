import {Article, ArticleType, SiteType} from '../domain/model/Article';

const numberOfPagesForUpdate = 2;

export abstract class ArticleParser {

    abstract init(): Promise<void | Article[]>[];

    updateArticles(): Promise<void | Article[]>[] {
        return this.readArticles(numberOfPagesForUpdate);
    };

    abstract readArticlePage(pageNumber?: number): Promise<void | Article[]>;

    readArticles(numberOfPages: number): Promise<void | Article[]>[] {
        const pagePromises: Promise<void | Article[]>[] = [];
        for (let i = 1; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    createArticle(title: string, articleUrl: string, site: SiteType, types: ArticleType[]): Article {
        return {
            title: title,
            site: site,
            url: articleUrl,
            published: false,
            needPublish: true,
            types: types
        };
    }

}