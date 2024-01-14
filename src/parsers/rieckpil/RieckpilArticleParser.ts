import {Article, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

export abstract class RieckpilArticleParser extends ArticleParser {

    private readonly selector = 'article .thrive-shortcode-content > a';

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.RIECKPIL;
    }

    getUrl(): string {
        return `https://rieckpil.de/category/${this.getCategory()}`;
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