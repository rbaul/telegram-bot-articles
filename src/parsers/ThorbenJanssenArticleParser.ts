import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://thorben-janssen.com/blog'; // URL we're scraping
const numberOfPages = 26;

export class ThorbenJanssenArticleParser extends ArticleParser {

    private readonly selector = '.entry-title > a';

    getType(): ParserType {
        return ParserType.THORBEN_JANSSEN;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.THORBEN_JANSSEN;
    }

    getUrl(): string {
        return url;
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