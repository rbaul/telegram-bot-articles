import {Article, ArticleType, ParserType, SiteType} from '../../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from '../ArticleParser';
import {axiosInstance} from '../../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const url = 'https://spring.io/blog?page='; // URL we're scraping
const numberOfPages = 10;

export class BlogsSpringIoArticleParser extends ArticleParser {

    getType(): ParserType {
        return ParserType.SPRING_IO_BLOGS;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getSite(): SiteType {
        return SiteType.SpringIO;
    }

    isNeedPublish(): boolean {
        return false;
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
                    const contents: Cheerio = $('.blog--title > a');

                    const articlesFromPage: Article[] = [];
                    contents.each((index, element) => {
                        const attribs = element.attribs;
                        const articleUrl = `https://spring.io${attribs.href}`;
                        const title = element.children[0].data;
                        articlesFromPage.push(this.createArticle(title, articleUrl));
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => console.error(`Failed read page '${fullUrl}' with error: ${error.message}`));// Error handling
    }

}