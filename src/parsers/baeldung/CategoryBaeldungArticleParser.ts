import {Article, SiteType} from '../../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from '../ArticleParser';
import {axiosInstance} from '../../services/ArticleManager';
import {retry} from 'ts-retry-promise';


export abstract class CategoryBaeldungArticleParser extends ArticleParser {

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.BAELDUNG;
    }

    getUrl(): string {
        return `https://www.baeldung.com/category/${this.getCategory()}/page/`;
    }

    readArticlePage(pageNumber: number): Promise<void | Article[]> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${this.getUrl()}${pageNumber}`;

        return retry(() => axiosInstance.get(fullUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const contents: Cheerio = $('.post-title > a');

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
        ).catch(error => console.error(`Failed read page '${fullUrl}' with error: ${error.message}`));// Error handling
    }

}