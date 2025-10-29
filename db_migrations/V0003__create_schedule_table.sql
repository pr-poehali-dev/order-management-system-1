CREATE TABLE t_p435659_order_management_sys.schedule (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p435659_order_management_sys.users(id),
    work_date DATE NOT NULL,
    hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, work_date)
);