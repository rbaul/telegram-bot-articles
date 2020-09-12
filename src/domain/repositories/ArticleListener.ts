import {Article} from '../model/Article';

/**
 * Article change listener
 */
export interface ArticleListener {

    newArticle(article: Article): void;
}