import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

const url = 'https://spring.io/blog'; // URL we're scraping
const numberOfPages = 3;

export class BlogsSpringIoArticleParser extends ArticleParser {

    private readonly selector = 'article > h1 > a';

    getType(): ParserType {
        return ParserType.SPRING_IO_BLOGS;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.SpringIO;
    }

    isNeedPublish(): boolean {
        return false;
    }

    getUrl(): string {
        return url;
    }

    public getFullUrl(pageNumber: number): string {
        return (pageNumber && pageNumber > 1) ? `${this.getUrl()}/page-${pageNumber}` : this.getUrl();
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