import {ArticleType, ParserType} from '../../domain/model/Article';
import {CategoryBaeldungArticleParser} from './CategoryBaeldungArticleParser';

const numberOfPages = 1;

export class JavaCategoryBaeldungArticleParser extends CategoryBaeldungArticleParser {

    getType(): ParserType {
        return ParserType.JAVA_CATEGORY_BAELDUNG;
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