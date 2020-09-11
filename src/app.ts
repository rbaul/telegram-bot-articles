import express from 'express';
import http from 'http';
import {RecurrenceRule, scheduleJob} from 'node-schedule';
import dotenv from 'dotenv';
import {Article} from './domain/model/Article';
import {ArticleManager} from './services/ArticleManager';
import {defaultRetryConfig} from 'ts-retry-promise';
import {TelegramBotPublisher} from './services/TelegramBotPublisher';

// Read all environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;

// Default Retry configuration
defaultRetryConfig.retries = 3;
defaultRetryConfig.delay = 500;
defaultRetryConfig.timeout = 4 * 60 * 1000;

const articleManager: ArticleManager = ArticleManager.createEmbeddedManager();

app.get('/', ((req, res) => res.sendStatus(200)));

app.get('/articles', (req, res) => {

    // let site: SiteType = req.query.site as SiteType;

    let articles: Article[] = articleManager.repository.findAll();
    res.send({
        size: articles.length,
        content: articles
    });
});

app.listen(port, () => {

    // Sync all resources
    const syncRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    syncRecurrenceRule.hour = [11, 15, 21];
    syncRecurrenceRule.minute = 0;
    scheduleJob(syncRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Update all articles from all sources and publish all new...`);
        articleManager.sync();
    });

    // Archive publisher scheduler
    const dailyArchivePublisherRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyArchivePublisherRecurrenceRule.hour = [12, 16, 22];
    dailyArchivePublisherRecurrenceRule.minute = 0;
    scheduleJob(dailyArchivePublisherRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Archive articles publish...`);
        articleManager.publishRandomArchiveArticles();
    });

    // Daily clear counters
    const dailyInitRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyInitRecurrenceRule.hour = 3;
    dailyInitRecurrenceRule.minute = 0;
    scheduleJob(dailyInitRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Init daily published counters...`);
        ArticleManager.clearPublisherDailyCounter();
    });

    TelegramBotPublisher.getInstance().sendMessageToActivityLogChannel(`Started application... ${process.env.npm_package_description}`);
    return console.log(`server is listening on ${port}`);
})

setInterval(() => {
    const keepAliveUrl: string = process.env.KEEP_ALIVE_URL;
    if (keepAliveUrl) {
        http.get(keepAliveUrl);
    }
}, Number(process.env.KEEP_ALIVE_INTERVAL_S) * 1000);





