import {Repository} from './Repository';
import {Article, ParserType, SiteType} from '../model/Article';
import {ArticleListener} from './ArticleListener';
import sql from '../../db/database';

export class PostgresRepository implements Repository<Article> {

    private _articleListener: ArticleListener;

    constructor(articleListener?: ArticleListener) {
        this._articleListener = articleListener;
    }

    set articleListener(value: ArticleListener) {
        this._articleListener = value;
    }

    async findByUrl(url: string): Promise<Article> {
        const result = await sql`
            SELECT * FROM articles WHERE url = ${url}
        `;
        return result.length > 0 ? this.mapRowToArticle(result[0]) : null;
    }

    async isExistByUrl(url: string): Promise<boolean> {
        const result = await sql`
            SELECT 1 FROM articles WHERE url = ${url} LIMIT 1
        `;
        return result.length > 0;
    }

    async findAll(): Promise<Article[]> {
        const result = await sql`
            SELECT * FROM articles
        `;
        return result.map(row => this.mapRowToArticle(row));
    }

    async save(article: Article): Promise<Article> {
        const exists = await this.isExistByUrl(article.url);
        
        if (exists) {
            await sql`
                UPDATE articles 
                SET 
                    title = ${article.title},
                    published = ${article.published ?? false},
                    need_publish = ${article.needPublish ?? false},
                    site = ${article.site},
                    types = ${article.types ? sql.array(article.types) : null},
                    parser = ${article.parser},
                    updated_at = NOW()
                WHERE url = ${article.url}
            `;
        } else {
            await sql`
                INSERT INTO articles (title, url, published, need_publish, site, types, parser)
                VALUES (
                    ${article.title},
                    ${article.url},
                    ${article.published ?? false},
                    ${article.needPublish ?? false},
                    ${article.site},
                    ${article.types ? sql.array(article.types) : null},
                    ${article.parser}
                )
            `;
            
            if (this._articleListener) {
                this._articleListener.newArticle(article);
            }
        }
        
        return this.findByUrl(article.url);
    }

    async saveAll(articles: Article[]): Promise<Article[]> {
        const savedArticles: Article[] = [];
        
        for (const article of articles) {
            const exists = await this.isExistByUrl(article.url);
            if (!exists) {
                const saved = await this.save(article);
                savedArticles.push(saved);
            }
        }
        
        return savedArticles;
    }

    async deleteByUrl(url: string): Promise<boolean> {
        const result = await sql`
            DELETE FROM articles WHERE url = ${url}
        `;
        return result.count > 0;
    }

    async findBySite(site: SiteType): Promise<Article[]> {
        const result = await sql`
            SELECT * FROM articles WHERE site = ${site}
        `;
        return result.map(row => this.mapRowToArticle(row));
    }

    async findByParser(parserType: ParserType): Promise<Article[]> {
        const result = await sql`
            SELECT * FROM articles WHERE parser = ${parserType}
        `;
        return result.map(row => this.mapRowToArticle(row));
    }

    async findByParserIn(parserTypes: ParserType[]): Promise<Article[]> {
        const result = await sql`
            SELECT * FROM articles WHERE parser = ANY(${sql.array(parserTypes)})
        `;
        return result.map(row => this.mapRowToArticle(row));
    }

    async getMapTypeCounts(): Promise<Map<SiteType, number>> {
        const map: Map<SiteType, number> = new Map<SiteType, number>();
        
        for (let siteType in SiteType) {
            const type = SiteType[siteType];
            const result = await sql`
                SELECT COUNT(*) as count FROM articles WHERE site = ${type}
            `;
            map.set(type, parseInt(result[0].count));
        }
        
        return map;
    }

    async deleteByParserTypeIn(parserTypes: ParserType[]): Promise<void> {
        await sql`
            DELETE FROM articles WHERE parser = ANY(${sql.array(parserTypes)})
        `;
    }

    saveToJsonFile(): void {
        console.log('saveToJsonFile is not implemented for PostgresRepository - data is persisted in database');
    }

    private mapRowToArticle(row: any): Article {
        const article = new Article();
        article.title = row.title;
        article.url = row.url;
        article.published = row.published;
        article.needPublish = row.need_publish;
        article.site = row.site as SiteType;
        article.types = row.types;
        article.parser = row.parser as ParserType;
        return article;
    }
}
