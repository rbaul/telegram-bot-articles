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

export enum ParserType {
    SPRING_REFLECTORING_IO = 'SPRING_REFLECTORING_IO',
    JAVA_REFLECTORING_IO = 'JAVA_REFLECTORING_IO',
    SPRING_CATEGORY_BAELDUNG = 'SPRING_CATEGORY_BAELDUNG',
    JAVA_CATEGORY_BAELDUNG = 'JAVA_CATEGORY_BAELDUNG',
    JAVA_WEEKLY_BAELDUNG = 'JAVA_WEEKLY_BAELDUNG',
    SPRING_FRAMEWORK_GURU = 'SPRING_FRAMEWORK_GURU',
    SPRING_IO_BLOGS = 'SPRING_IO_BLOGS',
    SPRING_IO_GUIDES = 'SPRING_IO_GUIDES'
}

export class Article {
    title?: string;
    url?: string;
    published?: boolean;
    needPublish?: boolean;
    site?: SiteType;
    types?: ArticleType[];
    parser?: ParserType;
}
