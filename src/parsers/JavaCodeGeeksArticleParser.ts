import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://www.javacodegeeks.com/category/java'; // URL we're scraping
const numberOfPages = 4;

export class JavaCodeGeeksArticleParser extends ArticleParser {

    private readonly selector = '.post-title > a';

    getType(): ParserType {
        return ParserType.JAVA_CODE_GEEKS;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.JAVA];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.JAVA_CODE_GEEKS;
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