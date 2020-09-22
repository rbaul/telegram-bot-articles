import {ArticleType, ParserType} from '../../domain/model/Article';
import {RieckpilArticleParser} from './RieckpilArticleParser';

const numberOfPages = 5;

export class SpringRieckpilArticleParser extends RieckpilArticleParser {

    getCategory(): string {
        return 'spring-framework';
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

    getType(): ParserType {
        return ParserType.SPRING_RIECKPIL;
    }

}