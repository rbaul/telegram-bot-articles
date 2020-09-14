import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const url = 'https://springframework.guru/blog/page/'; // URL we're scraping
const numberOfPages = 17;

export class SpringFrameworkGuruArticleParser extends ArticleParser {

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

    readArticlePage(pageNumber: number): Promise<void | Article[]> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${url}${pageNumber}`;

        return retry(() => axiosInstance.get(fullUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const contents: Cheerio = $('.entry-title > a');

                    const articlesFromPage: Article[] = [];
                    contents.each((index, element) => {
                        const attribs = element.attribs;
                        const articleUrl = attribs.href;
                        const title = attribs.title;
                        articlesFromPage.push(this.createArticle(title, articleUrl));
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => this.handleError(fullUrl, error));// Error handling
    }

}