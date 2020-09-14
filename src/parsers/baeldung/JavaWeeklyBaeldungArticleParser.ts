import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from '../ArticleParser';
import {axiosInstance} from '../../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const url = 'https://www.baeldung.com';

export class JavaWeeklyBaeldungArticleParser extends ArticleParser {

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

    init(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    updateArticles(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    readArticlePage(): Promise<void | Article[]> {
        return retry(() => axiosInstance.get(url)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const contents: Cheerio = $('.thrv_wrapper > p > .tve-froala');

                    const articlesFromPage: Article[] = [];
                    contents.each((index, element) => {
                        const attribs = element.attribs;
                        const articleUrl = `${url}${attribs.href}`;
                        if (attribs.href.includes('/java-weekly')) {
                            const title = element.children[0].data;
                            articlesFromPage.push(this.createArticle(title, articleUrl));
                        }
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => console.error(`Failed read page '${url}' with error: ${error.message}`));// Error handling
    }

}