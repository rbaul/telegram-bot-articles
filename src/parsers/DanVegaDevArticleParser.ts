import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://www.danvega.dev/blog'; // URL we're scraping
const numberOfPages = 2;

export class DanVegaDevArticleParser extends ArticleParser {

    private readonly selector = 'h2 > a';

    getType(): ParserType {
        return ParserType.DAN_VEGA;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.DAN_VEGA;
    }

    getUrl(): string {
        return url;
    }

    public getFullUrl(pageNumber: number): string {
        return (pageNumber && pageNumber > 1) ? `${this.getUrl()}/${pageNumber}` : this.getUrl();
    }

    getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = `https://www.danvega.dev${attribs.href}`;
            const title = element.children[1].children[0].data;
            if (title.toLocaleLowerCase().includes('spring boot')){
                articlesFromPage.push(this.createArticle(title, articleUrl));
            }
        });
        return articlesFromPage;
    }

    getElementSelector(): string {
        return this.selector;
    }

}