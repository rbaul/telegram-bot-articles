import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import {ArticleParser} from '../ArticleParser';

const url = 'https://www.baeldung.com';

export class JavaWeeklyBaeldungArticleParser extends ArticleParser {

    private readonly selector = '.elementor-widget-container > p > a';

    getType(): ParserType {
        return ParserType.JAVA_WEEKLY_BAELDUNG;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING, ArticleType.JAVA];
    }

    getNumberOfPages(): number {
        return 0;
    }

    getSite(): SiteType {
        return SiteType.BAELDUNG;
    }

    getUrl(): string {
        return url;
    }

    isNeedPublish(): boolean {
        return false;
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
            if (attribs.href.includes('/java-weekly')) {
                const articleUrl = `${url}${attribs.href}`;
                const title = element.children[0].data;
                articlesFromPage.push(this.createArticle(title, articleUrl));
            }
        });
        return articlesFromPage;
    }

}