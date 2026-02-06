import { SecurityAdvisoriesSpringIoArticleParser } from './../parsers/spring_io/SecurityAdvisoriesSpringIoArticleParser';
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
import {articleDbJsonPath, EXCLUDE_PARSER_TYPE_PUBLISH} from '../app';
import {JavaReflectoringIoArticleParser} from '../parsers/reflectoring_io/JavaReflectoringIoArticleParser';
import {SpringReflectoringIoArticleParser} from '../parsers/reflectoring_io/SpringReflectoringIoArticleParser';
import {JavaCategoryBaeldungArticleParser} from '../parsers/baeldung/JavaCategoryBaeldungArticleParser';
import {GuidesSpringIoArticleParser} from '../parsers/spring_io/GuidesSpringIoArticleParser';
import {BetterJavaCodeArticleParser} from '../parsers/BetterJavaCodeArticleParser';
import {ThorbenJanssenArticleParser} from '../parsers/ThorbenJanssenArticleParser';
import {VladMihalceaArticleParser} from '../parsers/VladMihalceaArticleParser';
import {JavaCodeGeeksArticleParser} from '../parsers/JavaCodeGeeksArticleParser';
import {TelegramBotCommandListener} from './TelegramBotCommandListener';
import {SpringVinsGuruArticleParser} from '../parsers/vinsguru/SpringVinsGuruArticleParser';
import {SpringRieckpilArticleParser} from '../parsers/rieckpil/SpringRieckpilArticleParser';
import {PiotrminkowskiArticleParser} from '../parsers/piotrminkowski/PiotrminkowskiArticleParser';
import { DanVegaDevArticleParser } from '../parsers/DanVegaDevArticleParser';

export const axiosInstance: AxiosInstance = axios.create({
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/68.0.2704.79'
    }
}); // Create a new Axios Instance

export const dailyMaxNumberOfArticles: number = Number(process.env.DAILY_ARTICLES);

/**
 * Article Manager Service
 */
export class ArticleManager implements ArticleListener, TelegramBotCommandListener {

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
            new SecurityAdvisoriesSpringIoArticleParser(),
            new SpringFrameworkGuruArticleParser(),
            // new GuidesSpringIoArticleParser(), // Not Supported
            new BetterJavaCodeArticleParser(),
            new ThorbenJanssenArticleParser(),
            new VladMihalceaArticleParser(),
            new JavaCodeGeeksArticleParser(),
            new SpringVinsGuruArticleParser(),
            new SpringRieckpilArticleParser(),
            new PiotrminkowskiArticleParser(),
            new DanVegaDevArticleParser()
        ];
    }

    /**
     * Initialization
     */
    public async init() {
        TelegramBotPublisher.getInstance().setCommandListener(this);

        if (Utils.isFileExist(articleDbJsonPath)) {
            console.log(`Initialization from file '${articleDbJsonPath}'`);
            let articles: Article[] = Utils.fileToObject(articleDbJsonPath) as Article[];
            const articlesSaved = await this.repository.saveAll(articles);
            this.loadingFinished(articlesSaved, 'json file');
            const allArticles = await this.repository.findAll();
            this.initParserArticlesFromResource(Utils.getAllParserTypes(allArticles));
        } else { // No stored articles
            this.initParserArticlesFromResource();
        }

        // Delete no need articles
        // this.deleteArticlesWithoutParser();

    }

    /**
     * Update articles from all resources
     * @return articles that saved
     */
    private async updateArticles(data: (void | Article[])[]): Promise<Article[]> {
        const articlesMatrix: Article[][] = data.filter(value => value)
            .map(value => value as Article[]);
        const articles: Article[] = [].concat(...articlesMatrix);
        return await this.repository.saveAll(articles);
    }

    /**
     * Init articles with new parser
     */
    public initParserArticlesFromResource(excludeParser: ParserType[] = []): void {
        console.log('Initialization from all resources');
        const articleReadPromise: Promise<void | Article[]>[] = [];
        ArticleManager.INIT_FINISH = false;

        this.articleParsers
            .filter(parser => !excludeParser.includes(parser.getType()))
            .forEach(value => articleReadPromise.push(...value.getAll()));
        Promise.all(articleReadPromise).then(async (data) => {
            const articlesSaved = await this.updateArticles(data);
            this.loadingFinished(articlesSaved);
            ArticleManager.INIT_FINISH = true;
        });

    }

    /**
     * Delete articles without parser
     */
    public async deleteArticlesWithoutParser(): Promise<void> {
        const allArticles = await this.repository.findAll();
        const parserTypesPersisted: ParserType[] = Utils.getAllParserTypes(allArticles);
        let parserTypes = this.articleParsers.map(value => value.getType());
        const deleteArticleParserTypes: ParserType[] = parserTypesPersisted
            .filter(parserName => !parserTypes.includes(parserName));
        if (deleteArticleParserTypes.length > 0) {
            console.log(`Articles without parser: [${deleteArticleParserTypes}], starting delete...`)
            TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel(`Delete articles by parser: ${deleteArticleParserTypes}`)
            await this.repository.deleteByParserTypeIn(deleteArticleParserTypes);
        }
    }

    /**
     * Loading Finished notification
     */
    private loadingFinished(articles: Article[], from: string = 'sites') {
        const articlesParserCount = Utils.mapToString(Utils.getMapParserTypeCounts(articles));
        const articlesTypeCount = Utils.mapToString(Utils.getMapArticleTypeCounts(articles));
        const message = `Finish article loading from ${from}, number of articles added: ${articles.length}\n\n${articlesTypeCount}\n\n${articlesParserCount}`;
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

    /**
     * Create PostgreSQL Manager Instance
     */
    public static createPostgresManager(): ArticleManager {
        const { PostgresRepository } = require('../domain/repositories/PostgresRepository');
        const postgresRepository = new PostgresRepository();
        const articleManager = new ArticleManager(postgresRepository);
        postgresRepository.articleListener = articleManager;
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
    public async sync(): Promise<void> {
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Synchronize all articles from all sources');
        if (ArticleManager.INIT_FINISH) {
            const articleReadPromise: Promise<void | Article[]>[] = [];
            this.articleParsers.forEach(value => articleReadPromise.push(...value.getLatest()));
            const data = await Promise.all(articleReadPromise);
            const newArticles: Article[] = await this.updateArticles(data);
            this.loadingFinished(newArticles);
        }
    }

    /**
     * Publish archive articles
     */
    public publishRandomArchiveArticles(): void {
        if (ArticleManager.INIT_FINISH) {
            TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Publish archive articles');
            if (ArticleManager.isCanPublishToday(ArticleType.SPRING)) {
                this.publishRandomSpringArticle();
            }

            if (ArticleManager.isCanPublishToday(ArticleType.JAVA)) {
                this.publishRandomJavaArticle();
            }
        }
    }

    private async publishRandomSpringArticle() {
        if (ArticleManager.INIT_FINISH) {

            // Random Archive publish
            const allArticles = await this.repository.findAll();
            let articles: Article[] = allArticles
                .filter(value => !value.published && value.types.includes(ArticleType.SPRING)
                    && !EXCLUDE_PARSER_TYPE_PUBLISH.includes(value.parser));
            const article: Article = Utils.getRandomFromArray(articles);
            if (article) {
              TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article).then(() => this.publishSuccess(article));
              if (article.types.includes(ArticleType.JAVA)) {
                  TelegramBotPublisher.getInstance().sendArticleToJavaChannel(article).then(() => this.publishSuccess(article));
              }
            }

        }
    }

    private async publishRandomJavaArticle() {
        if (ArticleManager.INIT_FINISH) {

            // Random Archive publish
            const allArticles = await this.repository.findAll();
            let articles: Article[] = allArticles
                .filter(value => !value.published && value.types.includes(ArticleType.JAVA)
                    && !EXCLUDE_PARSER_TYPE_PUBLISH.includes(value.parser));
            const article: Article = Utils.getRandomFromArray(articles);
            if (article) {
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
        this.repository.saveToJsonFile();
        article.types.forEach(articleType => ArticleManager.incrementArticlePublished(articleType));
    }

    async commandDelete(ctx: any): Promise<any> {
        if (ArticleManager.INIT_FINISH) {
            await this.deleteArticlesWithoutParser();
            return ctx.reply('Delete all articles without parser');
        } else {
            return ctx.reply('Failed Delete all articles without parser: still in progress');
        }
    }

    async commandInit(ctx: any): Promise<any> {
        if (ArticleManager.INIT_FINISH) {
            this.initParserArticlesFromResource();
            return ctx.reply('Init all articles started');
        } else {
            return ctx.reply('Failed init articles started: still in progress');
        }
    }

    async commandSync(ctx: any): Promise<any> {
        if (ArticleManager.INIT_FINISH) {
            await this.sync();
            return ctx.reply('Synchronize started');
        } else {
            return ctx.reply('Failed Synchronize started: still in progress');
        }
    }

    async commandStatus(ctx: any): Promise<any> {
        const articles = await this.repository.findAll();
        const articlesParserCount = Utils.mapToString(Utils.getMapParserTypeCounts(articles));
        const articlesTypeCount = Utils.mapToString(Utils.getMapArticleTypeCounts(articles));
        const message = `Articles status: ${articles.length}\n\n${articlesTypeCount}\n\n${articlesParserCount}`;
        return ctx.reply(message);
    }

    commandPublishSpring(ctx: any): any {
        this.publishRandomSpringArticle();
        return ctx.reply('Publish random archive SPRING articles started...');
    }

    commandPublishJava(ctx: any): any {
        this.publishRandomJavaArticle();
        return ctx.reply('Publish random archive JAVA articles started...');
    }

    commandSave(ctx: any): any {
        this.repository.saveToJsonFile();
        return ctx.reply('Saved all data to json file');
    }

}