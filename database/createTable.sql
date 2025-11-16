-- 启用外键约束
PRAGMA foreign_keys = ON;

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
                                      price REAL NOT NULL,
                                      size TEXT NOT NULL,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
                                      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      customer_id INTEGER NOT NULL,
                                      pizza_id INTEGER NOT NULL,
                                      quantity INTEGER NOT NULL,
                                      total_price REAL NOT NULL,
                                      status TEXT DEFAULT 'Pending',
                                      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                                      FOREIGN KEY (pizza_id) REFERENCES pizzas(pizza_id) ON DELETE CASCADE
);

-- 插入示例披萨数据
INSERT INTO pizzas (name, description, price, size) VALUES
                                                        ('玛格丽特', '经典玛格丽特披萨，配新鲜番茄、马苏里拉奶酪和罗勒', 12.99, '中'),
                                                        ('意大利辣香肠', '香辣意大利辣香肠配马苏里拉奶酪', 14.99, '中'),
                                                        ('四季披萨', '四种口味组合：蘑菇、火腿、朝鲜蓟和橄榄', 16.99, '中'),
                                                        ('海鲜披萨', '新鲜海鲜搭配特制酱料', 18.99, '中'),
                                                        ('素食披萨', '多种新鲜蔬菜搭配', 13.99, '中'),
                                                        ('玛格丽特', '经典玛格丽特披萨', 9.99, '小'),
                                                        ('意大利辣香肠', '香辣意大利辣香肠', 11.99, '小'),
                                                        ('玛格丽特', '经典玛格丽特披萨', 15.99, '大'),
                                                        ('意大利辣香肠', '香辣意大利辣香肠', 17.99, '大');

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_pizza_id ON orders(pizza_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);