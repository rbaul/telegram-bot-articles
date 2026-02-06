import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Article } from '../domain/model/Article';

// Load environment variables BEFORE importing database
dotenv.config();

async function populateDatabase() {
    try {
        console.log('Starting database population...');
        
        // Import database and repository after dotenv is loaded
        const { default: sql } = require('./database');
        const { PostgresRepository } = require('../domain/repositories/PostgresRepository');
        
        const jsonPath = path.join(__dirname, '../../articles_db.json');
        
        if (!fs.existsSync(jsonPath)) {
            console.error(`Error: File not found at ${jsonPath}`);
            process.exit(1);
        }
        
        console.log(`Reading articles from ${jsonPath}...`);
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const articlesData = JSON.parse(jsonContent);
        
        if (!Array.isArray(articlesData)) {
            console.error('Error: JSON file does not contain an array of articles');
            process.exit(1);
        }
        
        console.log(`Found ${articlesData.length} articles in JSON file`);
        
        const articles: Article[] = articlesData.map((data: any) => {
            const article = new Article();
            article.title = data.title;
            article.url = data.url;
            article.published = data.published ?? false;
            article.needPublish = data.needPublish ?? false;
            article.site = data.site;
            article.types = data.types;
            article.parser = data.parser;
            return article;
        });
        
        const repository = new PostgresRepository();
        
        console.log('Inserting articles into database...');
        const savedArticles = await repository.saveAll(articles);
        
        console.log('\n=== Population Summary ===');
        console.log(`Total articles in file: ${articlesData.length}`);
        console.log(`New articles inserted: ${savedArticles.length}`);
        console.log(`Skipped (already exist): ${articlesData.length - savedArticles.length}`);
        console.log('=========================\n');
        
        console.log('Database population completed successfully!');
        
        await sql.end();
        process.exit(0);
    } catch (error) {
        console.error('Population failed:', error);
        process.exit(1);
    }
}

populateDatabase();
