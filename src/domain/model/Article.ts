export enum SiteType {
    BAELDUNG = 'Baeldung',
    ReflectoringIO = 'ReflectoringIO',
    SpringIO = 'SpringIO',
    Spring_Framework_Guru = 'Spring Framework Guru',
    BETTER_JAVA_CODE = 'BETTER_JAVA_CODE',
    VLAD_MIHALCEA = 'VLAD_MIHALCEA',
    THORBEN_JANSSEN = 'THORBEN_JANSSEN',
    JAVA_CODE_GEEKS = 'JAVA_CODE_GEEKS'
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
    SPRING_IO_GUIDES = 'SPRING_IO_GUIDES',
    BETTER_JAVA_CODE = 'BETTER_JAVA_CODE',
    VLAD_MIHALCEA = 'VLAD_MIHALCEA',
    THORBEN_JANSSEN = 'THORBEN_JANSSEN',
    JAVA_CODE_GEEKS = 'JAVA_CODE_GEEKS'
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
