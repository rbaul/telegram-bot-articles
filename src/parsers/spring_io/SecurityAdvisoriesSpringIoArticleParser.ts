import { ParserType } from '../../domain/model/Article';
import { BlogsSpringIoArticleParser } from './BlogsSpringIoArticleParser';

const url = 'https://spring.io/security'; // URL we're scraping
const numberOfPages = 1;

export class SecurityAdvisoriesSpringIoArticleParser extends BlogsSpringIoArticleParser {

    getType(): ParserType {
        return ParserType.SPRING_IO_SECURITI_ADVISORIES;
    }

    getNumberOfPages(): number {
        return numberOfPages;
    }

    getUrl(): string {
        return url;
    }

    public getElementSelector(): string {
        return 'article > h2 > a';
    }

}