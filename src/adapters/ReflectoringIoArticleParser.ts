import {SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';

import {retry} from 'ts-retry-promise';

const url = 'https://reflectoring.io/categories/spring-boot/page/'; // URL we're scraping
const numberOfPages = 12;

export class ReflectoringIoArticleParser extends ArticleParser {

    init(): Promise<void>[] {
        return this.readArticles(numberOfPages);
    }

    readArticles(numberOfPages: number): Promise<void>[] {
        const pagePromises: Promise<void>[] = [];
        pagePromises.push(this.readArticleByUrl('https://reflectoring.io/categories/spring-boot/'));
        for (let i = 2; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    readArticlePage(pageNumber: number): Promise<void> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${url}${pageNumber}`;

        return this.readArticleByUrl(fullUrl);
    }

    private readArticleByUrl(fullUrl: string): Promise<void> {
        return retry(() => axiosInstance.get(fullUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const statsTable: Cheerio = $('.post-title > a'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
                    statsTable.each((index, element) => {
                        // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
                        const attribs = element.attribs;
                        const articleUrl = `https://reflectoring.io${attribs.href}`;
                        if (!this.repository.isExistByUrl(articleUrl)) {
                            const title = element.children[0].data;
                            this.repository.save(this.createArticle(title, articleUrl, SiteType.ReflectoringIO));
                        }
                    })
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(console.error);// Error handling;
    }
}