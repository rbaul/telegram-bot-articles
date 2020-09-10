import {ArticleType, SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const javaWeeklyUrl = 'https://www.baeldung.com';
const url = 'https://www.baeldung.com/category/spring/page/'; // URL we're scraping
const numberOfPages = 41;
const numberOfPagesForUpdate = 2;

export class BaeldungArticleParser extends ArticleParser {

    init(): Promise<void>[] {
        let javaWeeklyArticles = this.javaWeeklyArticles();
        let readArticles = this.readArticles(numberOfPages);
        readArticles.push(javaWeeklyArticles)
        return readArticles;
    }

    updateArticles(): Promise<void>[] {
        let javaWeeklyArticles = this.javaWeeklyArticles();
        let readArticles = this.readArticles(numberOfPagesForUpdate);
        readArticles.push(javaWeeklyArticles)
        return readArticles;
    }

    readArticlePage(pageNumber: number): Promise<void> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = `${url}${pageNumber}`;

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
                        const articleUrl = attribs.href;
                        if (!this.repository.isExistByUrl(articleUrl)) {
                            const title = attribs.title;
                            this.repository.save(this.createArticle(title, articleUrl, SiteType.BAELDUNG));
                        }
                    })
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
            .catch(console.error)// Error handling
        );
    }

    private javaWeeklyArticles(): Promise<void> {
        return retry(() => axiosInstance.get(javaWeeklyUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const statsTable: Cheerio = $('.tcb-col > .thrv_wrapper > p > a'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
                    statsTable.each((index, element) => {
                        // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
                        const attribs = element.attribs;
                        const articleUrl = `${javaWeeklyUrl}${attribs.href}`;
                        if (attribs.href.includes('/java-weekly')) {
                            if (!this.repository.isExistByUrl(articleUrl)) {
                                const title = element.children[0].data;
                                this.repository.save({
                                    title: title,
                                    site: SiteType.BAELDUNG,
                                    url: articleUrl,
                                    published: false,
                                    needPublish: false,
                                    type: ArticleType.JAVA
                                });
                            }
                        }
                    })
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
            .catch(console.error) // Error handling
        );
    }

}