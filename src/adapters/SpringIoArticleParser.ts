import {Article, ArticleType, SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const url = 'https://spring.io/blog?page='; // URL we're scraping
const numberOfPages = 10;

export class SpringIoArticleParser extends ArticleParser {

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
                    const statsTable: Cheerio = $('.blog--title > a'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
                    statsTable.each((index, element) => {
                        // let attribs: PostTitleAAttribs = element.attribs as PostTitleAAttribs;
                        const attribs = element.attribs;
                        const articleUrl = `https://spring.io${attribs.href}`;
                        if (!this.repository.isExistByUrl(articleUrl)) {
                            const title = element.children[0].data;
                            this.repository.save(this.createArticle(title, articleUrl, SiteType.SpringIO));
                        }
                    })
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(console.error);// Error handling;
    }

    createArticle(title: string, articleUrl: string, site: SiteType): Article {
        return {
            title: title,
            site: site,
            url: articleUrl,
            published: false,
            needPublish: false,
            type: ArticleType.SPRING
        };
    }

}