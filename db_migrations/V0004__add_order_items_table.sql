CREATE TABLE IF NOT EXISTS t_p435659_order_management_sys.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    material VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR(100),
    color VARCHAR(100),
    completed_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON t_p435659_order_management_sys.order_items(order_id);