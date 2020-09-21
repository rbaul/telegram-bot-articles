import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {ArticleParser} from './ArticleParser';

const url = 'https://springframework.guru/blog'; // URL we're scraping
const numberOfPages = 17;

export class SpringFrameworkGuruArticleParser extends ArticleParser {

    private readonly selector = '.entry-title > a';

    getType(): ParserType {
        return ParserType.SPRING_FRAMEWORK_GURU;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.Spring_Framework_Guru;
    }

    getUrl(): string {
        return url;
    }

    getArticlesFromPage(contents: Cheerio): Article[] {
        const articlesFromPage: Article[] = [];
        contents.each((index, element) => {
            const attribs = element.attribs;
            const articleUrl = attribs.href;
            const title = attribs.title;
            articlesFromPage.push(this.createArticle(title, articleUrl));
        });
        return articlesFromPage;
    }

    getElementSelector(): string {
        return this.selector;
    }

}