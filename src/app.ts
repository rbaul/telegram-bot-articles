import express from 'express';
import {RecurrenceRule, scheduleJob} from 'node-schedule';
import dotenv from 'dotenv';
import {Article} from './domain/model/Article';
import {ArticleManager} from './services/ArticleManager';

// Read all environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;

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
    syncRecurrenceRule.hour = [8, 12, 18];
    scheduleJob(syncRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Update all articles from all sources and publish all new...`);
        articleManager.sync();
    });

    // Archive publisher scheduler
    const dailyArchivePublisherRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyArchivePublisherRecurrenceRule.hour = [9, 13, 19];
    scheduleJob(dailyArchivePublisherRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Archive articles publish...`);
        articleManager.publishRandomArchiveArticles();
    });

    // Daily clear counters
    const dailyInitRecurrenceRule: RecurrenceRule = new RecurrenceRule();
    dailyInitRecurrenceRule.hour = 0;
    scheduleJob(dailyInitRecurrenceRule, fireDate => {
        console.log(`${fireDate} - Init daily published counters...`);
        ArticleManager.clearPublisherDailyCounter();
    });

    return console.log(`server is listening on ${port}`);
})







