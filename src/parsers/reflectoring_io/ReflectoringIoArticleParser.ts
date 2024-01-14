import {Article, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

export abstract class ReflectoringIoArticleParser extends ArticleParser {

    private readonly selector = '.title-linked';

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.ReflectoringIO;
    }

    getUrl(): string {
        return `https://reflectoring.io/categories/${this.getCategory()}`;
    }

    public getElementSelector(): string {
        return this.selector;
    }

    public getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
            const attribs = element.attribs;
            const articleUrl = `https://reflectoring.io${attribs.href}`;
            const title = element.children[0].data;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }
}