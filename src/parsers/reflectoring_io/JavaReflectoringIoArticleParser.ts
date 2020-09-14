import {ArticleType, ParserType} from '../../domain/model/Article';
import {ReflectoringIoArticleParser} from './ReflectoringIoArticleParser';

const numberOfPages = 6;

export class JavaReflectoringIoArticleParser extends ReflectoringIoArticleParser {

    getType(): ParserType {
        return ParserType.JAVA_REFLECTORING_IO;
    }

    getCategory(): string {
        return 'java';
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.JAVA];
    }

}