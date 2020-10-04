import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

const url = 'https://spring.io/guides'; // URL we're scraping

export class GuidesSpringIoArticleParser extends ArticleParser {

    private readonly selector = '.guide-link';

    getType(): ParserType {
        return ParserType.SPRING_IO_GUIDES;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return 0;
    }

    getSite(): SiteType {
        return SiteType.SpringIO;
    }

    getUrl(): string {
        return url;
    }

    getAll(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    getLatest(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    public getElementSelector(): string {
        return this.selector;
    }

    public getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = `https://spring.io${attribs.href}`;
            const title = element.children[0].data;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }

}