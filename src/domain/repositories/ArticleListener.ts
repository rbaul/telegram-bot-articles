import {Article, ArticleType} from '../model/Article';
import {TelegramBotPublisher} from '../../services/TelegramBotPublisher';
import {ArticleManager} from '../../services/ArticleManager';

/**
 * Article change listener
 */
export class ArticleListener {

    public newArticle(article: Article): void {
        if (ArticleManager.INIT_FINISH) {
            if (article.type === ArticleType.SPRING) {
                TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article, true);
            }
        }
    }
}