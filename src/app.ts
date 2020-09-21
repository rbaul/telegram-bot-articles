import express from 'express';
import {RecurrenceRule, RecurrenceSegment, scheduleJob} from 'node-schedule';
import dotenv from 'dotenv';
import {Article} from './domain/model/Article';
import {ArticleManager, axiosInstance} from './services/ArticleManager';
import {defaultRetryConfig} from 'ts-retry-promise';
import {TelegramBotPublisher} from './services/TelegramBotPublisher';

// Read all environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;
export const articleDbJsonPath = process.env.ARTICLES_DB_JSON_PATH;
const timeZone: string = process.env.TIME_ZONE;
const archiveScheduler: RecurrenceSegment = process.env.ARCHIVE_SCHEDULER_HOURS ? JSON.parse(process.env.ARCHIVE_SCHEDULER_HOURS) as RecurrenceSegment : null;
const syncScheduler: RecurrenceSegment = process.env.SYNC_SCHEDULER_HOURS ? JSON.parse(process.env.SYNC_SCHEDULER_HOURS) as RecurrenceSegment : null;

// Default Retry configuration
defaultRetryConfig.retries = 3;
defaultRetryConfig.delay = 500;
defaultRetryConfig.timeout = Number(process.env.RETRY_TIMEOUT) * 60 * 1000;

const articleManager: ArticleManager = ArticleManager.createEmbeddedManager();

app.get('/', ((req, res) => {
    console.log('Keep Alive request');
    res.sendStatus(200);
}));

app.get('/articles', (req, res) => {

    // let site: SiteType = req.query.site as SiteType;

    let articles: Article[] = articleManager.repository.findAll();
    res.send({
        size: articles.length,
        content: articles
    });
});

app.listen(port, () => {

    TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel(`Started application...`);

    // Sync all resources
    const syncRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    syncRecurrenceRule.hour = syncScheduler;
    syncRecurrenceRule.minute = 0;
    syncRecurrenceRule.tz = timeZone;
    scheduleJob(syncRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Update all articles from all sources and publish all new...`);
        articleManager.sync();
    });

    // Archive publisher scheduler
    const dailyArchivePublisherRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyArchivePublisherRecurrenceRule.hour = archiveScheduler;
    dailyArchivePublisherRecurrenceRule.minute = 0;
    dailyArchivePublisherRecurrenceRule.tz = timeZone;
    scheduleJob(dailyArchivePublisherRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Archive articles publish...`);
        articleManager.publishRandomArchiveArticles();
    });

    // Daily clear counters
    const dailyInitRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyInitRecurrenceRule.hour = 0;
    dailyInitRecurrenceRule.minute = 0;
    dailyInitRecurrenceRule.tz = timeZone;
    scheduleJob(dailyInitRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Init daily published counters...`);
        ArticleManager.clearPublisherDailyCounter();
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM received, cleaning up...');
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('SIGTERM received... Application shutdown...');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('Received SIGINT. Press Control-D to exit.');
        TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel('Received SIGINT..  Application shutdown...');
        process.exit(0);
    });

    articleManager.init();
    return console.log(`server is listening on ${port}`);
})

setInterval(() => {
    const keepAliveUrl: string = process.env.KEEP_ALIVE_URL;
    if (keepAliveUrl) {
        axiosInstance.get(keepAliveUrl)
            .catch(error => `Failed execute Keep Alive: ${error.message}`);
    }
}, Number(process.env.KEEP_ALIVE_INTERVAL_S) * 1000);





