-- Пользователи системы
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Материалы
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    color VARCHAR(100),
    quantity DECIMAL(10, 2) DEFAULT 0,
    material_type VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заявки
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    material VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR(100),
    color VARCHAR(100),
    status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed', 'shipped')),
    completed_quantity INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Остатки материалов (история)
CREATE TABLE IF NOT EXISTS material_inventory (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    quantity_change DECIMAL(10, 2) NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка администратора по умолчанию
INSERT INTO users (login, password, role, full_name) 
VALUES ('admin', 'adminik', 'admin', 'Администратор')
ON CONFLICT (login) DO NOTHING;

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);