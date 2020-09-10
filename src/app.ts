import express from 'express';
import {RecurrenceRule, scheduleJob} from 'node-schedule';
import dotenv from 'dotenv';
import {Article} from './domain/model/Article';
import {ArticleManager} from './services/ArticleManager';
import {defaultRetryConfig} from 'ts-retry-promise';

// Read all environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;
defaultRetryConfig.retries = 3;

const articleManager: ArticleManager = ArticleManager.createEmbeddedManager();

app.get('/', (req, res) => {

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

    return console.log(`server is listening on ${port}`);
})







