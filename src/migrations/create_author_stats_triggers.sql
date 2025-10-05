-- Удаляем старые функции и триггеры
DROP TRIGGER IF EXISTS products_update_count ON products;
DROP TRIGGER IF EXISTS products_update_categories ON products;
DROP FUNCTION IF EXISTS update_author_products_count();
DROP FUNCTION IF EXISTS update_author_product_categories();

-- 1. Подсчёт количества товаров у автора
CREATE OR REPLACE FUNCTION update_author_products_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Для вставки или обновления
    IF NEW.author_id IS NOT NULL THEN
        UPDATE authors
        SET products_count = (
            SELECT COUNT(*) FROM products WHERE author_id = NEW.author_id
        )
        WHERE id = NEW.author_id;
    END IF;

    -- Для удаления или смены автора
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.author_id IS NOT NULL THEN
        UPDATE authors
        SET products_count = (
            SELECT COUNT(*) FROM products WHERE author_id = OLD.author_id
        )
        WHERE id = OLD.author_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Обновление категорий автора
CREATE OR REPLACE FUNCTION update_author_product_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Для вставки или обновления
    IF NEW.author_id IS NOT NULL THEN
        DELETE FROM authors_product_categories WHERE _parent_id = NEW.author_id;

        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT
            NEW.author_id,
            gen_random_uuid()::text,
            category::text,
            ROW_NUMBER() OVER (ORDER BY category)
        FROM (
            SELECT DISTINCT category FROM products
            WHERE author_id = NEW.author_id AND category IS NOT NULL
        ) AS unique_cats;
    END IF;

    -- Для удаления или смены автора
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.author_id IS NOT NULL AND (NEW.author_id IS NULL OR OLD.author_id <> NEW.author_id) THEN
        DELETE FROM authors_product_categories WHERE _parent_id = OLD.author_id;

        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT
            OLD.author_id,
            gen_random_uuid()::text,
            category::text,
            ROW_NUMBER() OVER (ORDER BY category)
        FROM (
            SELECT DISTINCT category FROM products
            WHERE author_id = OLD.author_id AND category IS NOT NULL
        ) AS unique_cats;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Триггеры
CREATE TRIGGER products_update_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_products_count();

CREATE TRIGGER products_update_categories
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_product_categories();

-- Перезаписать триггер:
-- psql -U art_user -d art_platform -f src/migrations/create_author_stats_triggers.sql
