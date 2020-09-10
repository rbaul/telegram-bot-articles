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

    const rule: RecurrenceRule = new RecurrenceRule();
    // rule.dayOfWeek = [0, new Range(0, 6)];
    // rule.hour = 18;
    // rule.minute = 0;
    rule.second = 0;

    scheduleJob(rule, fireDate => {
        console.log('Schedule starting... Update all articles from all sources...');
        articleManager.sync();
    });

    return console.log(`server is listening on ${port}`);
})







