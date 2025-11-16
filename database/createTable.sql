-- 创建客户表
CREATE TABLE IF NOT EXISTS customers (
                                         customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         email TEXT NOT NULL UNIQUE,
                                         phone TEXT NOT NULL,
                                         address TEXT NOT NULL,
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建披萨表
CREATE TABLE IF NOT EXISTS pizzas (
                                      pizza_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      name TEXT NOT NULL,
                                      description TEXT,
                                      price REAL NOT NULL CHECK(price > 0),
                                      size TEXT NOT NULL,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
                                      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      customer_id INTEGER NOT NULL,
                                      pizza_id INTEGER NOT NULL,
                                      quantity INTEGER NOT NULL CHECK(quantity > 0),
                                      total_price REAL NOT NULL CHECK(total_price > 0),
                                      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
                                      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                                      FOREIGN KEY (pizza_id) REFERENCES pizzas(pizza_id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_pizza_id ON orders(pizza_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);