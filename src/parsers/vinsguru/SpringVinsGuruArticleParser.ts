import {ArticleType, ParserType} from '../../domain/model/Article';
import {VinsGuruIoArticleParser} from './VinsGuruArticleParser';

const numberOfPages = 3;

export class SpringVinsGuruArticleParser extends VinsGuruIoArticleParser {

    getCategory(): string {
        return 'spring';
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getType(): ParserType {
        return ParserType.SPRING_VINS_GURU;
    }

}