import {Article, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

export abstract class VinsGuruIoArticleParser extends ArticleParser {

    private readonly selector = '.entry-title > a';

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.VINS_GURU;
    }

    getUrl(): string {
        return `https://blog.vinsguru.com/category/${this.getCategory()}`;
    }

    public getElementSelector(): string {
        return this.selector;
    }

    public getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = attribs.href;
            const title = element.children[0].data;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }
}