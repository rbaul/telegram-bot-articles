import {Article, ArticleType} from '../model/Article';
import {TelegramBotPublisher} from '../../services/TelegramBotPublisher';
import {ArticleManager} from '../../services/ArticleManager';

export class ArticleListener {

    // private static instance: ArticleListener;
    //
    // private constructor() {
    // }
    //
    // public static getInstance(): ArticleListener {
    //     if (!ArticleListener.instance) {
    //         ArticleListener.instance = new ArticleListener();
    //     }
    //     return ArticleListener.instance;
    // }

    public newArticle(article: Article): void {
        if (ArticleManager.INIT_FINISH) {
            if (article.type === ArticleType.SPRING) {
                TelegramBotPublisher.getInstance().sendArticleToSpringChannel(article, true);
            }
        }
    }
}