import {ArticleType, ParserType} from '../../domain/model/Article';
import {ReflectoringIoArticleParser} from './ReflectoringIoArticleParser';

const numberOfPages = 12;

export class SpringReflectoringIoArticleParser extends ReflectoringIoArticleParser {

    getCategory(): string {
        return 'spring-boot';
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getType(): ParserType {
        return ParserType.SPRING_REFLECTORING_IO;
    }

}