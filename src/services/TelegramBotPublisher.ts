import {Telegraf} from 'telegraf';
import emoji from 'node-emoji-new';
import {Article} from '../domain/model/Article';
import {retry} from 'ts-retry-promise';

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
            .catch(error =>
                console.error(`Failed send message '${message}' to '${channelId}', error: ${error.message}`)); // Error handling
    }

    public sendArticleToJavaChannel(article: Article, isNewArticle?: boolean): Promise<any | void> {
        return this.sendArticleToChannel(process.env.JAVA_CHANNEL_ID, article, isNewArticle)
            .catch(error =>
                console.error(`Failed send article message '${JSON.stringify(article)}' to Java channel, error: ${error.message}`)); // Error handling
    }

    public sendArticleToSpringChannel(article: Article, isNewArticle?: boolean): Promise<any | void> {
        return this.sendArticleToChannel(process.env.SPRING_CHANNEL_ID, article, isNewArticle)
            .catch(error =>
                console.error(`Failed send article message '${JSON.stringify(article)}' to Spring channel, error: ${error.message}`)); // Error handling
    }

    public sendArticleToChannel(channelId: string, article: Article, isNewArticle?: boolean): Promise<any | void> {
        console.log(`Publish ${JSON.stringify(article)}`);
        const tagEmoji: string = isNewArticle ? this.newTagEmoji : this.oldTagEmoji;
        const message: string = `${tagEmoji} ${article.title} \n\n ${article.url}`;
        return retry(() => this.sendMessage(channelId, message));
    }

    /**
     * Send message to activity log channel
     */
    public sendMessageToActivityLogChannel(message: string): void {
        retry(() => this.sendMessage(process.env.ACTIVITY_LOG_APP_CHANNEL_ID,
            `[${process.env.APP_NAME}]\n\n${message}`))
            .catch(error =>
                console.error(`Failed send activity log message '${message}' to Activity Log channel, error: ${error.message}`)); // Error handling
    }
}