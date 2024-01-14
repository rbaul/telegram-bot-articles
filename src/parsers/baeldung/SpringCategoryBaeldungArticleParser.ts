import {ArticleType, ParserType} from '../../domain/model/Article';
import {CategoryBaeldungArticleParser} from './CategoryBaeldungArticleParser';

const numberOfPages = 1;

export class SpringCategoryBaeldungArticleParser extends CategoryBaeldungArticleParser {

    getType(): ParserType {
        return ParserType.SPRING_CATEGORY_BAELDUNG;
    }

    getCategory(): string {
        return 'spring';
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getArticleType(): ArticleType[] {
        return [ArticleType.SPRING];
    }

}