export interface TelegramBotCommandListener {

    commandStatus(ctx: any): any;

    commandInit(ctx: any): any;

    commandDelete(ctx: any): any;

    commandSync(ctx: any): any;

    commandPublish(ctx: any): any;
}