import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://betterjavacode.com'; // URL we're scraping
const numberOfPages = 20;

export class BetterJavaCodeArticleParser extends ArticleParser {

    private readonly selector = '.entry-title > a';

    getType(): ParserType {
        return ParserType.BETTER_JAVA_CODE;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.BETTER_JAVA_CODE;
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