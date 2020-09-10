export enum SiteType {
    BAELDUNG = 'Baeldung',
    ReflectoringIO = 'ReflectoringIO',
    SpringIO = 'SpringIO',
    Spring_Framework_Guru = 'Spring Framework Guru'
}

export enum ArticleType {
    SPRING = 'Spring',
    JAVA = 'Java'
}

export class Article {
    title: string;
    url: string;
    published: boolean;
    needPublish: boolean;
    site: SiteType;
    type: ArticleType;
}
