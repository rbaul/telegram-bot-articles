import {Article, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';


export abstract class CategoryBaeldungArticleParser extends ArticleParser {

    private readonly selector = '.post-title > a';

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.BAELDUNG;
    }

    getUrl(): string {
        return `https://www.baeldung.com/category/${this.getCategory()}`;
    }

    public getElementSelector(): string {
        return this.selector;
    }

    public getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = attribs.href;
            const title = attribs.title;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }

}