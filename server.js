const express = require('express');
const path = require('path');

// 导入路由
const customerRoutes = require('./routes/customers');
const pizzaRoutes = require('./routes/pizzas');
const orderRoutes = require('./routes/orders');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 静态文件服务（可选，用于提供文档等）
app.use(express.static(path.join(__dirname, 'public')));

// CORS中间件（允许跨域请求）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 路由配置
app.use('/api/customers', customerRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);

// 根路径路由 - API信息
app.get('/', (req, res) => {
    res.json({
        message: '🍕 披萨订购系统 API',
        version: '1.0.0',
        endpoints: {
            customers: '/api/customers',
            pizzas: '/api/pizzas',
            orders: '/api/orders'
        },
        documentation: '请查看 README.md 文件了解详细API文档'
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404处理 - 未找到路由
app.use('*', (req, res) => {
    res.status(404).json({
        error: '路由未找到',
        path: req.originalUrl,
        method: req.method
    });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error('❌ 服务器错误:', err.stack);

    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 披萨订购系统API服务器正在运行`);
    console.log(`📍 服务器地址: http://localhost:${PORT}`);
    console.log(`📚 API文档: http://localhost:${PORT}/`);
    console.log(`❤️  健康检查: http://localhost:${PORT}/health`);
    console.log('--- 可用端点 ---');
    console.log(`👥 客户管理: http://localhost:${PORT}/api/customers`);
    console.log(`🍕 披萨菜单: http://localhost:${PORT}/api/pizzas`);
    console.log(`📦 订单管理: http://localhost:${PORT}/api/orders`);
});

module.exports = app;