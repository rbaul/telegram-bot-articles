import {Article, ArticleType, SiteType} from '../domain/model/Article';
import cheerio from "cheerio";
import {ArticleParser} from './ArticleParser';
import {axiosInstance} from '../services/ArticleManager';
import {retry} from 'ts-retry-promise';

const javaWeeklyUrl = 'https://www.baeldung.com';

export class JavaWeeklyBaeldungArticleParser extends ArticleParser {

    init(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    updateArticles(): Promise<void | Article[]>[] {
        return [this.readArticlePage()];
    }

    readArticlePage(): Promise<void | Article[]> {
        return retry(() => axiosInstance.get(javaWeeklyUrl)
            .then( // Once we have data returned ...
                response => {
                    const html = response.data; // Get the HTML from the HTTP request
                    // console.log(html);
                    const $ = cheerio.load(html); // Load the HTML string into cheerio
                    const contents: Cheerio = $('.tcb-col > .thrv_wrapper > p > a');

                    const articlesFromPage: Article[] = [];
                    contents.each((index, element) => {
                        const attribs = element.attribs;
                        const articleUrl = `${javaWeeklyUrl}${attribs.href}`;
                        if (attribs.href.includes('/java-weekly')) {
                            const title = element.children[0].data;
                            articlesFromPage.push({
                                title: title,
                                site: SiteType.BAELDUNG,
                                url: articleUrl,
                                published: false,
                                needPublish: false,
                                types: [ArticleType.SPRING, ArticleType.JAVA]
                            });
                        }
                    });
                    return articlesFromPage;
                    // console.log(`Finish read page: ${fullUrl}`)
                }
            )
        ).catch(error => console.error(`Failed read page '${javaWeeklyUrl}' with error: ${error.message}`));// Error handling
    }

}