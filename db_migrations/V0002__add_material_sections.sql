-- Разделы материалов
CREATE TABLE IF NOT EXISTS material_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем связь материалов с разделами
ALTER TABLE materials ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES material_sections(id);

-- Создаем индекс для быстрого поиска по разделам
CREATE INDEX IF NOT EXISTS idx_materials_section ON materials(section_id);