import {ArticleParser} from '../adapters/ArticleParser';
import {BaeldungArticleParser} from '../adapters/BaeldungArticleParser';
import {ReflectoringIoArticleParser} from '../adapters/ReflectoringIoArticleParser';
import {SpringIoArticleParser} from '../adapters/SpringIoArticleParser';
import {SpringFrameworkGuruArticleParser} from '../adapters/SpringFrameworkGuruArticleParser';
import axios, {AxiosInstance} from 'axios';
import {Repository} from '../domain/repositories/Repository';
import {Article, ArticleType} from '../domain/model/Article';
import {TelegramBotPublisher} from './TelegramBotPublisher';
import {EmbeddedRepository} from '../domain/repositories/EmbeddedRepository';
import {ArticleListener} from '../domain/repositories/ArticleListener';

export const axiosInstance: AxiosInstance = axios.create(); // Create a new Axios Instance

export const dailyMaxNumberOfArticles: number = Number(process.env.DAILY_ARTICLES);

/**
 * Article Manager Service
 */
export class ArticleManager {

    articleParsers: ArticleParser[] = [];

    repository: Repository<Article>;

    public static INIT_FINISH: boolean = false;

    public static publishedDailyArticles: Map<ArticleType, number> = new Map<ArticleType, number>();

    constructor(repository: Repository<Article>) {
        this.repository = repository;
        this.articleParsers = [
            new BaeldungArticleParser(this.repository),
            new ReflectoringIoArticleParser(this.repository),
            new SpringIoArticleParser(this.repository),
            new SpringFrameworkGuruArticleParser(this.repository)
        ];

        const articleReadPromise: Promise<void>[] = [];
        this.articleParsers.forEach(value => articleReadPromise.push(...value.init()));
        Promise.all(articleReadPromise).then(() => {
            const articlesCount = ArticleManager.mapToString(this.repository.getMapTypeCounts());
            let message = `Finish Initial article loading, number of articles: ${this.repository.findAll().length} \n\n${articlesCount}`;
            console.log(message);
            ArticleManager.INIT_FINISH = true;

            TelegramBotPublisher.getInstance()
                .sendMessageToActivityLogChannel(message);
        });
    }

    public static isCanPublishToday(articleType: ArticleType): boolean {
        return this.getPublishedToday(articleType) < dailyMaxNumberOfArticles;
    }

    private static getPublishedToday(articleType: ArticleType) {
        return this.publishedDailyArticles.get(articleType) | 0;
    }

    public static incrementArticlePublished(articleType: ArticleType): void {
        if (!this.publishedDailyArticles.has(articleType)) {
            this.publishedDailyArticles.set(articleType, 0);
        }
        this.publishedDailyArticles.set(articleType, this.publishedDailyArticles.get(articleType) + 1)
    }

    public static clearPublisherDailyCounter(): void {
        this.publishedDailyArticles.clear();
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Clear publisher daily counters');
    }

    /**
     * Create Embedded Manager Instance
     */
    public static createEmbeddedManager(): ArticleManager {
        return new ArticleManager(new EmbeddedRepository(new ArticleListener()));
    }

    /**
     * Synchronize all articles from all sources
     */
    public sync(): void {
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Synchronize all articles from all sources');
        if (ArticleManager.INIT_FINISH) {
            this.articleParsers.forEach(value => value.updateArticles());
        }
    }

    /**
     * Publish archive articles
     */
    public publishRandomArchiveArticles(): void {
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Publish archive articles');
        if (ArticleManager.INIT_FINISH) {

            if (ArticleManager.isCanPublishToday(ArticleType.SPRING)) {
                // Random Archive publish
                let articles: Article[] = this.repository.findAll()
                    .filter(value => value.needPublish && !value.published && value.type === ArticleType.SPRING);
                let article = articles[Math.floor(Math.random() * articles.length)];
                TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article);
            }
        }
    }

    public static mapToString(map: Map<any, any>): string {
        let ro = {};
        for (let entry of map.entries()) {
            ro[entry[0]] = entry[1];
        }
        return JSON.stringify(ro);
    }
}