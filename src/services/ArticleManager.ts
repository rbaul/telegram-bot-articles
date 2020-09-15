import {ArticleParser} from '../parsers/ArticleParser';
import {SpringCategoryBaeldungArticleParser} from '../parsers/baeldung/SpringCategoryBaeldungArticleParser';
import {BlogsSpringIoArticleParser} from '../parsers/spring_io/BlogsSpringIoArticleParser';
import {SpringFrameworkGuruArticleParser} from '../parsers/SpringFrameworkGuruArticleParser';
import axios, {AxiosInstance} from 'axios';
import {Repository} from '../domain/repositories/Repository';
import {Article, ArticleType, ParserType} from '../domain/model/Article';
import {TelegramBotPublisher} from './TelegramBotPublisher';
import {EmbeddedRepository} from '../domain/repositories/EmbeddedRepository';
import {ArticleListener} from '../domain/repositories/ArticleListener';
import {Utils} from '../Utils';
import {JavaWeeklyBaeldungArticleParser} from '../parsers/baeldung/JavaWeeklyBaeldungArticleParser';
import {articleDbJsonPath} from '../app';
import {JavaReflectoringIoArticleParser} from '../parsers/reflectoring_io/JavaReflectoringIoArticleParser';
import {SpringReflectoringIoArticleParser} from '../parsers/reflectoring_io/SpringReflectoringIoArticleParser';
import {JavaCategoryBaeldungArticleParser} from '../parsers/baeldung/JavaCategoryBaeldungArticleParser';
import {GuidesSpringIoArticleParser} from '../parsers/spring_io/GuidesSpringIoArticleParser';
import {BetterJavaCodeArticleParser} from '../parsers/BetterJavaCodeArticleParser';
import {ThorbenJanssenArticleParser} from '../parsers/ThorbenJanssenArticleParser';
import {VladMihalceaArticleParser} from '../parsers/VladMihalceaArticleParser';
import {JavaCodeGeeksArticleParser} from '../parsers/JavaCodeGeeksArticleParser';

export const axiosInstance: AxiosInstance = axios.create(); // Create a new Axios Instance

export const dailyMaxNumberOfArticles: number = Number(process.env.DAILY_ARTICLES);

/**
 * Article Manager Service
 */
export class ArticleManager implements ArticleListener {

    articleParsers: ArticleParser[] = [];

    repository: Repository<Article>;

    public static INIT_FINISH: boolean = false;

    public static publishedDailyArticles: Map<ArticleType, number> = new Map<ArticleType, number>();

    constructor(repository: Repository<Article>) {
        this.repository = repository;
        this.articleParsers = [
            new JavaWeeklyBaeldungArticleParser(),
            new JavaCategoryBaeldungArticleParser(),
            new SpringCategoryBaeldungArticleParser(),
            new JavaReflectoringIoArticleParser(),
            new SpringReflectoringIoArticleParser(),
            new BlogsSpringIoArticleParser(),
            new SpringFrameworkGuruArticleParser(),
            new GuidesSpringIoArticleParser(),
            new BetterJavaCodeArticleParser(),
            new ThorbenJanssenArticleParser(),
            new VladMihalceaArticleParser(),
            new JavaCodeGeeksArticleParser()
        ];
    }

    /**
     * Initialization
     */
    public init() {
        if (Utils.isFileExist(articleDbJsonPath)) {
            console.log(`Initialization from file '${articleDbJsonPath}'`);
            let articles: Article[] = Utils.fileToObject(articleDbJsonPath) as Article[];
            const articlesSaved = this.repository.saveAll(articles);
            this.loadingFinished(articlesSaved, 'json file');
            ArticleManager.INIT_FINISH = true;
        }

        this.initArticlesFromAllSites();
    }

    /**
     * Initialization articles from all resources
     */
    private initArticlesFromAllSites() {
        console.log('Initialization from all resources');
        const articleReadPromise: Promise<void | Article[]>[] = [];
        this.articleParsers.forEach(value => articleReadPromise.push(...value.init()));
        Promise.all(articleReadPromise).then((data) => {
            const articlesSaved = this.updateArticlesFromAllResources(data);
            this.loadingFinished(articlesSaved);
            ArticleManager.INIT_FINISH = true;
        });
    }

    /**
     * Update articles from all resources
     * @return articles that saved
     */
    private updateArticlesFromAllResources(data: (void | Article[])[]): Article[] {
        const articlesMatrix: Article[][] = data.filter(value => value)
            .map(value => value as Article[]);
        const articles: Article[] = [].concat(...articlesMatrix);
        let articlesThatSaved: Article[] = [];

        const parserTypesPersisted: ParserType[] = Utils.getAllParserTypes(this.repository.findAll());
        const newArticleParserNames: string[] = this.articleParsers
            .filter(parser => !parserTypesPersisted.includes(parser.getType()))
            .map(value => value.getType());

        if (newArticleParserNames.length > 0) { // New parser will not notify in init
            ArticleManager.INIT_FINISH = false;
            const articlesToSaveWithoutNotification = articles.filter(article => newArticleParserNames.includes(article.parser));
            articlesThatSaved.push(...this.repository.saveAll(articlesToSaveWithoutNotification));
            ArticleManager.INIT_FINISH = true;
        }

        // TODO: delete

        const articlesToSaveWithNotification = articles.filter(article => !newArticleParserNames.includes(article.parser));
        articlesThatSaved.push(...this.repository.saveAll(articlesToSaveWithNotification));
        return articlesThatSaved;
    }

    /**
     * Loading Finished notification
     */
    private loadingFinished(articles: Article[], from: string = 'sites') {
        const articlesParserCount = Utils.mapToString(Utils.getMapParserTypeCounts(articles));
        const articlesTypeCount = Utils.mapToString(Utils.getMapArticleTypeCounts(articles));
        let message = `Finish article loading from ${from}, number of articles added: ${articles.length}\n\n${articlesTypeCount}\n\n${articlesParserCount}`;
        console.log(message);

        TelegramBotPublisher.getInstance()
            .sendMessageToActivityLogChannel(message);
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
        const embeddedRepository = new EmbeddedRepository();
        const articleManager = new ArticleManager(embeddedRepository);
        embeddedRepository.articleListener = articleManager;
        return articleManager;
    }

    public newArticle(article: Article): void {
        if (ArticleManager.INIT_FINISH) {
            if (article.types.includes(ArticleType.SPRING)) {
                TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article, true)
                    .then(() => this.publishSuccess(article));
            }
            if (article.types.includes(ArticleType.JAVA)) {
                TelegramBotPublisher.getInstance().sendArticleToJavaChannel(article, true)
                    .then(() => this.publishSuccess(article));
            }
        }
    }

    /**
     * Synchronize all articles from all sources
     */
    public sync(): void {
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Synchronize all articles from all sources');
        if (ArticleManager.INIT_FINISH) {
            const articleReadPromise: Promise<void | Article[]>[] = [];
            this.articleParsers.forEach(value => articleReadPromise.push(...value.updateArticles()));
            Promise.all(articleReadPromise).then((data) => {
                const newArticles: Article[] = this.updateArticlesFromAllResources(data);
                this.loadingFinished(newArticles);
            });
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
                    .filter(value => value.needPublish && !value.published && value.types.includes(ArticleType.SPRING));
                let article = articles[Math.floor(Math.random() * articles.length)];
                TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article).then(() => this.publishSuccess(article));
                if (article.types.includes(ArticleType.JAVA)) {
                    TelegramBotPublisher.getInstance().sendArticleToJavaChannel(article).then(() => this.publishSuccess(article));
                }
            }

            if (ArticleManager.isCanPublishToday(ArticleType.JAVA)) {
                // Random Archive publish
                let articles: Article[] = this.repository.findAll()
                    .filter(value => value.needPublish && !value.published && value.types.includes(ArticleType.JAVA));
                let article = articles[Math.floor(Math.random() * articles.length)];
                TelegramBotPublisher.getInstance().sendArticleToJavaChannel(article).then(() => this.publishSuccess(article));
                if (article.types.includes(ArticleType.SPRING)) {
                    TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article).then(() => this.publishSuccess(article));
                }
            }
        }
    }

    /**
     * Publish success
     */
    private publishSuccess(article: Article) {
        article.published = true;
        // Update json backup file
        Utils.objectToFile(process.env.ARTICLES_DB_JSON_PATH, this.repository.findAll());
        ArticleManager.incrementArticlePublished(ArticleType.SPRING);
    }
}