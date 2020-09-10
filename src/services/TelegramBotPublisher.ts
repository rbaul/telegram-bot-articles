import {Telegraf} from 'telegraf';
import emoji from 'node-emoji-new';
import {Article, ArticleType} from '../domain/model/Article';
import {ArticleManager} from './ArticleManager';

/**
 * Telegram Bot publisher
 */
export class TelegramBotPublisher {

    private static instance: TelegramBotPublisher;

    private bot: Telegraf<any>;
    private newTagEmoji: string = emoji.get('NEW_button');
    private oldTagEmoji: string = emoji.get('file_folder');

    private constructor() {
        this.bot = new Telegraf(process.env.BOT_TOKEN);
    }

    public static getInstance(): TelegramBotPublisher {
        if (!TelegramBotPublisher.instance) {
            TelegramBotPublisher.instance = new TelegramBotPublisher();
        }
        return TelegramBotPublisher.instance;
    }

    public sendMessage(channelId: string, message: string): Promise<any> {
        return this.bot.telegram.sendMessage(channelId, message)
            .catch(console.error); // Error handling
    }

    public sendMessageToSpringChannel(message: string): Promise<any> {
        return this.sendMessage(process.env.CHANNEL_ID, message);
    }

    public sendArticleToSpringChannel(article: Article, isNewArticle?: boolean): Promise<any> {
        console.log(`Publish ${JSON.stringify(article)}`);
        const tagEmoji: string = isNewArticle ? this.newTagEmoji : this.oldTagEmoji;
        return this.sendMessage(process.env.CHANNEL_ID,
            `${tagEmoji} ${article.title}  \n\n ${article.url}`)
            .then(value => {
                article.published = true;
                ArticleManager.incrementArticlePublished(ArticleType.SPRING);
            });
    }
}