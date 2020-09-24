export interface TelegramBotCommandListener {

    commandStatus(ctx: any): any;

    commandInit(ctx: any): any;

    commandDelete(ctx: any): any;

    commandSync(ctx: any): any;

    commandPublishSpring(ctx: any): any;

    commandSave(ctx: any): any;

    commandPublishJava(ctx: any): any;
}