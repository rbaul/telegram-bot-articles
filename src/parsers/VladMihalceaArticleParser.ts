import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://vladmihalcea.com/blog'; // URL we're scraping
const numberOfPages = 3;

export class VladMihalceaArticleParser extends ArticleParser {

    private readonly selector = '.headline > a';

    getType(): ParserType {
        return ParserType.VLAD_MIHALCEA;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.VLAD_MIHALCEA;
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