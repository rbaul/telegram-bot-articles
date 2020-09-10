import {SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const url = 'https://springframework.guru/blog/page/'; // URL we're scraping
const numberOfPages = 17;

export class SpringFrameworkGuruArticleParser extends ArticleParser {

    init(): Promise<void>[] {
        return this.readArticles(numberOfPages);
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
                    const statsTable: Cheerio = $('.entry-title > a'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
                    statsTable.each((index, element) => {
                        // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
                        const attribs = element.attribs;
                        const articleUrl = attribs.href;
                        if (!this.repository.isExistByUrl(articleUrl)) {
                            const title = attribs.title;
                            this.repository.save(this.createArticle(title, articleUrl, SiteType.Spring_Framework_Guru));
                        }
                    })
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(console.error);// Error handling;
    }

}