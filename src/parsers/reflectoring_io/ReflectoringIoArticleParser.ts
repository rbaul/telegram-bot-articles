import {Article, SiteType} from '../../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from '../ArticleParser';
import {axiosInstance} from '../../services/ArticleManager';

import {retry} from 'ts-retry-promise';

export abstract class ReflectoringIoArticleParser extends ArticleParser {

    abstract getCategory(): string;

    getSite(): SiteType {
        return SiteType.ReflectoringIO;
    }

    getUrl(): string {
        return `https://reflectoring.io/categories/${this.getCategory()}/page/`;
    }

    readArticles(numberOfPages: number): Promise<void | Article[]>[] {
        const pagePromises: Promise<void | Article[]>[] = [];
        pagePromises.push(this.readArticleByUrl(`https://reflectoring.io/categories/${this.getCategory()}/`));
        for (let i = 2; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    readArticlePage(pageNumber: number): Promise<void | Article[]> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${this.getUrl()}${pageNumber}`;

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
                        articlesFromPage.push(this.createArticle(title, articleUrl));
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => this.handleError(fullUrl, error));// Error handling
    }
}