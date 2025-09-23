-- Удаляем старые функции и триггеры
DROP FUNCTION IF EXISTS update_author_stats();
DROP TRIGGER IF EXISTS products_update_author_stats ON products;

-- 1. Функция для обновления products_count (триггер на products)
CREATE OR REPLACE FUNCTION update_author_products_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Всегда обновляем для new_author_id (INSERT/UPDATE)
    IF NEW.author_id IS NOT NULL THEN
        UPDATE authors
        SET products_count = (SELECT COUNT(*) FROM products WHERE author_id = NEW.author_id)
        WHERE id = NEW.author_id;
    END IF;

    -- Для old_author_id (UPDATE/DELETE)
    IF OLD.author_id IS NOT NULL AND (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        UPDATE authors
        SET products_count = (SELECT COUNT(*) FROM products WHERE author_id = OLD.author_id)
        WHERE id = OLD.author_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Функция для обновления product_categories (триггер на products)
CREATE OR REPLACE FUNCTION update_author_product_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Для new_author_id (INSERT/UPDATE)
    IF NEW.author_id IS NOT NULL THEN
        DELETE FROM authors_product_categories WHERE _parent_id = NEW.author_id;
        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT NEW.author_id, gen_random_uuid()::text, category::text, ROW_NUMBER() OVER (ORDER BY category)
        FROM (SELECT DISTINCT category FROM products WHERE author_id = NEW.author_id AND category IS NOT NULL) AS unique_cats;
    END IF;

    -- Для old_author_id (UPDATE/DELETE)
    IF OLD.author_id IS NOT NULL AND (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') AND OLD.author_id <> NEW.author_id THEN
        DELETE FROM authors_product_categories WHERE _parent_id = OLD.author_id;
        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT OLD.author_id, gen_random_uuid()::text, category::text, ROW_NUMBER() OVER (ORDER BY category)
        FROM (SELECT DISTINCT category FROM products WHERE author_id = OLD.author_id AND category IS NOT NULL) AS unique_cats;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггеры
CREATE TRIGGER products_update_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_products_count();

CREATE TRIGGER products_update_categories
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_product_categories();

-- Перезаписать триггер:
-- psql -U art_user -d art_platform -f src/migrations/create_author_stats_triggers.sql
