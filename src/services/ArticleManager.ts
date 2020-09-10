import {ArticleParser} from '../adapters/ArticleParser';
import {BaeldungArticleParser} from '../adapters/BaeldungArticleParser';
import {ReflectoringIoArticleParser} from '../adapters/ReflectoringIoArticleParser';
import {SpringIoArticleParser} from '../adapters/SpringIoArticleParser';
import {SpringFrameworkGuruArticleParser} from '../adapters/SpringFrameworkGuruArticleParser';
import axios, {AxiosInstance} from 'axios';
import {Repository} from '../domain/repositories/Repository';
import {Article} from '../domain/model/Article';
import {TelegramBotPublisher} from './TelegramBotPublisher';
import {EmbeddedRepository} from '../domain/repositories/EmbeddedRepository';
import {ArticleListener} from '../domain/repositories/ArticleListener';

export const axiosInstance: AxiosInstance = axios.create(); // Create a new Axios Instance

/**
 * Article Manager Service
 */
export class ArticleManager {

    articleParsers: ArticleParser[] = [];

    repository: Repository<Article>;

    public static INIT_FINISH: boolean = false;

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
            console.log('Finish Initial loading...');
            ArticleManager.INIT_FINISH = true;
        });
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
        if (ArticleManager.INIT_FINISH) {
            this.articleParsers.forEach(value => value.init());
        }
        this.publishRandomArchiveArticles();
    }

    /**
     * Publish archive articles
     */
    public publishRandomArchiveArticles(): void {
        // Random Archive publish
        // const numberArchiveToPublish: number = 1;
        let articles: Article[] = this.repository.findAll()
            .filter(value => value.needPublish && !value.published);
        let article = articles[Math.floor(Math.random() * articles.length)];
        TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article);
    }
}