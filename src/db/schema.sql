-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    need_publish BOOLEAN DEFAULT FALSE,
    site TEXT,
    types TEXT[], -- Array of article types
    parser TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on url for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- Create index on site for filtering
CREATE INDEX IF NOT EXISTS idx_articles_site ON articles(site);

-- Create index on parser for filtering
CREATE INDEX IF NOT EXISTS idx_articles_parser ON articles(parser);

-- Create index on published status
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
