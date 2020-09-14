import {Article, ArticleType, ParserType, SiteType} from '../domain/model/Article';
import {TelegramBotPublisher} from '../services/TelegramBotPublisher';

const numberOfPagesForUpdate = 2;

export abstract class ArticleParser {

    abstract getType(): ParserType;

    abstract getUrl(): string;

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

    init(): Promise<void | Article[]>[] {
        return this.readArticles(this.getNumberOfPages());
    }

    updateArticles(): Promise<void | Article[]>[] {
        return this.readArticles(this.getNumberOfPagesForUpdate());
    };

    abstract readArticlePage(pageNumber?: number): Promise<void | Article[]>;

    readArticles(numberOfPages: number): Promise<void | Article[]>[] {
        const pagePromises: Promise<void | Article[]>[] = [];
        for (let i = 1; i <= numberOfPages; i++) {
            pagePromises.push(this.readArticlePage(i));
        }
        return pagePromises;
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
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel(message, true);
    }

}