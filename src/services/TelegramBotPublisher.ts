import {Telegraf} from 'telegraf';
import emoji from 'node-emoji-new';
import {Article} from '../domain/model/Article';
import {retry} from 'ts-retry-promise';
import {TelegramBotCommandListener} from './TelegramBotCommandListener';

/**
 * Telegram Bot publisher
 */
export class TelegramBotPublisher {

    private static instance: TelegramBotPublisher;

    private bot: Telegraf<any>;
    private newTagEmoji: string = emoji.get('NEW_button');
    private oldTagEmoji: string = emoji.get('file_folder');

    private successTagEmoji: string = emoji.get('green_circle');
    private errorTagEmoji: string = emoji.get('red_circle');

    private commandListener: TelegramBotCommandListener;

    private constructor() {
        this.bot = new Telegraf(process.env.BOT_TOKEN);

        this.bot.command('status', ctx => {
            if (this.commandListener) {
                return this.commandListener.commandStatus(ctx);
            }
        });

        this.bot.command('init', ctx => {
            if (this.commandListener) {
                return this.commandListener.commandInit(ctx);
            }
        });

        this.bot.command('delete', ctx => {
            if (this.commandListener) {
                return this.commandListener.commandDelete(ctx);
            }
        });

        this.bot.command('sync', ctx => {
            if (this.commandListener) {
                return this.commandListener.commandSync(ctx);
            }
        });
    }

    public static getInstance(): TelegramBotPublisher {
        if (!TelegramBotPublisher.instance) {
            TelegramBotPublisher.instance = new TelegramBotPublisher();
        }
        return TelegramBotPublisher.instance;
    }

    public setCommandListener(commandListener: TelegramBotCommandListener): void {
        this.commandListener = commandListener;
    }

    public sendMessage(channelId: string, message: string): Promise<any> {
        return this.bot.telegram.sendMessage(channelId, message);
        // .catch(error => {
        //     console.error(`Failed send message '${message}' to '${channelId}', error: ${error.message}`);
        //     throw error;
        // }); // Error handling
    }

    public sendArticleToJavaChannel(article: Article, isNewArticle?: boolean): Promise<any | void> {
        return this.sendArticleToChannel(process.env.JAVA_CHANNEL_ID, article, isNewArticle)
            .catch(error => {
                console.error(`Failed send article message '${JSON.stringify(article)}' to Java channel, error: ${error.message}`)
                throw error;
            }); // Error handling
    }

    public sendArticleToSpringChannel(article: Article, isNewArticle?: boolean): Promise<any | void> {
        return this.sendArticleToChannel(process.env.SPRING_CHANNEL_ID, article, isNewArticle)
            .catch(error => {
                console.error(`Failed send article message '${JSON.stringify(article)}' to Spring channel, error: ${error.message}`);
                throw error;
            }); // Error handling
    }

    public sendArticleToChannel(channelId: string, article: Article, isNewArticle?: boolean): Promise<any | void> {
        console.log(`Publish ${JSON.stringify(article)}`);
        const tagEmoji: string = isNewArticle ? this.newTagEmoji : this.oldTagEmoji;
        const message: string = `${tagEmoji} ${article.title} \n\n ${article.url}`;
        return retry(() => this.sendMessage(channelId, message));
        // return this.sendMessage(channelId, message);
    }

    /**
     * Send error message to activity log channel
     */
    public sendErrorMessageToActivityLogChannel(message: string): void {
        this.sendMessageToActivityLogChannel(message, true);
    }

    /**
     * Send message to activity log channel
     */
    public sendMessageToActivityLogChannel(message: string, isError: boolean = false): void {
        const statusEmoji: string = isError ? this.errorTagEmoji : this.successTagEmoji;
        retry(() => this.sendMessage(process.env.ACTIVITY_LOG_APP_CHANNEL_ID,
            `${statusEmoji} [${process.env.APP_NAME}]\n\n${message}`))
            .catch(error => {
                throw error;
            }).catch(error => console.error(`Failed send activity log message '${message}' to Activity Log channel, error: ${error.message}`)); // Error handling
    }
}