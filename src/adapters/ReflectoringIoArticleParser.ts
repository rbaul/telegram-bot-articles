import {Article, ArticleType, SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';

import {retry} from 'ts-retry-promise';

const url = 'https://reflectoring.io/categories/spring-boot/page/'; // URL we're scraping
const numberOfPages = 12;

export class ReflectoringIoArticleParser extends ArticleParser {

    init(): Promise<void | Article[]>[] {
        return this.readArticles(numberOfPages);
    }

    readArticles(numberOfPages: number): Promise<void | Article[]>[] {
        const pagePromises: Promise<void | Article[]>[] = [];
        pagePromises.push(this.readArticleByUrl('https://reflectoring.io/categories/spring-boot/'));
        for (let i = 2; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    readArticlePage(pageNumber: number): Promise<void | Article[]> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${url}${pageNumber}`;

        return this.readArticleByUrl(fullUrl);
    }

    private readArticleByUrl(fullUrl: string): Promise<void | Article[]> {
        return retry(() => axiosInstance.get(fullUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const contents: Cheerio = $('.post-title > a');

                    const articlesFromPage: Article[] = [];
                    contents.each((index, element) => {
                        // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
                        const attribs = element.attribs;
                        const articleUrl = `https://reflectoring.io${attribs.href}`;
                        const title = element.children[0].data;
                        articlesFromPage.push(this.createArticle(title, articleUrl, SiteType.ReflectoringIO, [ArticleType.SPRING]));
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => console.error(`Failed read page '${fullUrl}' with error: ${error.message}`));// Error handling
    }
}