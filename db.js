const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, 'database', 'database.db');

// 确保数据库目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message);
    } else {
        console.log('✅ 成功连接到 SQLite 数据库');

        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                console.error('❌ 启用外键约束失败:', err.message);
            } else {
                console.log('✅ 外键约束已启用');
            }
        });

        // 初始化数据库表
        initializeDatabase();
    }
});

// 初始化数据库表结构
function initializeDatabase() {
    const initSQL = `
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
    `;

    // 执行多条SQL语句
    db.exec(initSQL, (err) => {
        if (err) {
            console.error('❌ 数据库表初始化失败:', err.message);
        } else {
            console.log('✅ 数据库表初始化成功');

            // 插入示例数据
            insertSampleData();
        }
    });
}

// 插入示例数据
function insertSampleData() {
    // 检查是否已有数据
    db.get("SELECT COUNT(*) as count FROM pizzas", (err, row) => {
        if (err) {
            console.error('❌ 检查示例数据失败:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('📝 正在插入示例数据...');

            const samplePizzas = [
                ['玛格丽特', '经典玛格丽特披萨，配新鲜番茄、马苏里拉奶酪和罗勒', 12.99, '中'],
                ['意大利辣香肠', '香辣意大利辣香肠配马苏里拉奶酪', 14.99, '中'],
                ['四季披萨', '四种口味组合：蘑菇、火腿、朝鲜蓟和橄榄', 16.99, '中'],
                ['海鲜披萨', '新鲜海鲜搭配特制酱料', 18.99, '中'],
                ['素食披萨', '多种新鲜蔬菜搭配', 13.99, '中'],
                ['玛格丽特', '经典玛格丽特披萨', 9.99, '小'],
                ['意大利辣香肠', '香辣意大利辣香肠', 11.99, '小'],
                ['玛格丽特', '经典玛格丽特披萨', 15.99, '大'],
                ['意大利辣香肠', '香辣意大利辣香肠', 17.99, '大']
            ];

            const insertPizza = db.prepare("INSERT INTO pizzas (name, description, price, size) VALUES (?, ?, ?, ?)");

            samplePizzas.forEach(pizza => {
                insertPizza.run(pizza, (err) => {
                    if (err) {
                        console.error('❌ 插入披萨数据失败:', err.message);
                    }
                });
            });

            insertPizza.finalize();
            console.log('✅ 示例数据插入完成');
        } else {
            console.log('✅ 数据库已有数据，跳过示例数据插入');
        }
    });
}

module.exports = db;