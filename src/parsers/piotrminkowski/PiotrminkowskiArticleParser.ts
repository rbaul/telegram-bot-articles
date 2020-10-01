import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

const url = 'https://piotrminkowski.com'; // URL we're scraping
const numberOfPages = 16;

export class PiotrminkowskiArticleParser extends ArticleParser {

    private readonly selector = '.entry-title > a';

    getType(): ParserType {
        return ParserType.PIOTER_MINKOWSKI;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.PIOTER_MINKOWSKI;
    }

    getUrl(): string {
        return url;
    }

    getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = attribs.href;
            const title = element.children[0].data;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }

    getElementSelector(): string {
        return this.selector;
    }

}