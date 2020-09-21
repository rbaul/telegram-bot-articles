import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {TelegramBotPublisher} from '../services/TelegramBotPublisher';
import {retry} from 'ts-retry-promise';
import {axiosInstance} from '../services/ArticleManager';
import cheerio from "cheerio";

const numberOfPagesForUpdate = 2;

export abstract class ArticleParser {

    abstract getType(): ParserType;

    abstract getUrl(): string;

    public getFullUrl(pageNumber: number): string {
        return (pageNumber && pageNumber > 1) ? `${this.getUrl()}/page/${pageNumber}` : this.getUrl();
    }

    public abstract getElementSelector(): string;

    public abstract getArticlesFromPage(contents: Cheerio): Article[];

    abstract getNumberOfPages(): number;

    getNumberOfPagesForUpdate(): number {
        return numberOfPagesForUpdate;
    }

    abstract getSite(): SiteType;

    abstract getArticleType(): ArticleType[];

    isNeedPublish(): boolean {
        return true;
    }

    getTemplateArticle(): Article {
        return {
            site: this.getSite(),
            published: false,
            needPublish: this.isNeedPublish(),
            types: this.getArticleType(),
            parser: this.getType()
        };
    }

    getAll(): Promise<void | Article[]>[] {
        return this.readArticles(this.getNumberOfPages());
    }

    getLatest(): Promise<void | Article[]>[] {
        return this.readArticles(this.getNumberOfPagesForUpdate());
    }

    readArticles(numberOfPages: number): Promise<void | Article[]>[] {
        const pagePromises: Promise<void | Article[]>[] = [];
        for (let i = 1; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
    }

    readArticlePage(pageNumber?: number): Promise<void | Article[]> {
        // Send an async HTTP Get request to the url
        const fullUrl: string = this.getFullUrl(pageNumber);

        return retry(() => axiosInstance.get(fullUrl)
            .then(response => {
                if (!response.request._redirectable._currentUrl.includes(response.config.url)) {
                    throw new Error(`Redirect to '${response.request._redirectable._currentUrl}'`);
                }
                return response;
            })
            .then(response => {
                const html = response.data; // Get the HTML from the HTTP request
                // console.log(html);
                const $ = cheerio.load(html); // Load the HTML string into cheerio
                return $(this.getElementSelector());
            })
            .then( // Once we have data returned ...
                contents => this.getArticlesFromPage(contents)
            ).then(articles => {
                if (articles.length === 0) {
                    throw new Error(`No articles found on this page`);
                }
                return articles;
            })
        ).catch(error => this.handleError(fullUrl, error));// Error handling
    }

    createArticle(title: string, articleUrl: string): Article {
        let article = this.getTemplateArticle();
        article.title = title;
        article.url = articleUrl;
        return article;
    }

    handleError(url: string, error) {
        const message = `Failed read page '${url}' with error: ${error.message}`;
        console.error(message);
        TelegramBotPublisher.getInstance().sendErrorMessageToActivityLogChannel(message);
    }

}