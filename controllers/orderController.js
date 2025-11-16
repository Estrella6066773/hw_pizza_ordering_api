const db = require('../db');

/**
 * 订单控制器 - 处理所有订单相关的业务逻辑
 */

/**
 * 创建新订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const createOrder = (req, res) => {
    const { customer_id, pizza_id, quantity } = req.body;

    // 验证必填字段
    if (!customer_id || !pizza_id || !quantity) {
        return res.status(400).json({
            error: '所有字段都是必填的: customer_id, pizza_id, quantity'
        });
    }

    // 验证数量
    if (quantity <= 0) {
        return res.status(400).json({
            error: '数量必须大于0'
        });
    }

    // 开始事务处理
    db.serialize(() => {
        // 第一步：验证客户和披萨是否存在
        db.get('SELECT price FROM pizzas WHERE pizza_id = ?', [pizza_id], (err, pizza) => {
            if (err) {
                return res.status(500).json({
                    error: '验证披萨信息失败: ' + err.message
                });
            }

            if (!pizza) {
                return res.status(404).json({
                    error: '披萨不存在'
                });
            }

            db.get('SELECT customer_id FROM customers WHERE customer_id = ?', [customer_id], (err, customer) => {
                if (err) {
                    return res.status(500).json({
                        error: '验证客户信息失败: ' + err.message
                    });
                }

                if (!customer) {
                    return res.status(404).json({
                        error: '客户不存在'
                    });
                }

                // 计算总价
                const total_price = pizza.price * quantity;

                // 创建订单
                const sql = `INSERT INTO orders (customer_id, pizza_id, quantity, total_price) 
                             VALUES (?, ?, ?, ?)`;

                db.run(sql, [customer_id, pizza_id, quantity, total_price], function(err) {
                    if (err) {
                        return res.status(500).json({
                            error: '创建订单失败: ' + err.message
                        });
                    }

                    // 获取完整的订单信息
                    const getOrderSql = `
                        SELECT o.*, c.name as customer_name, c.email, c.phone, c.address,
                               p.name as pizza_name, p.description, p.size
                        FROM orders o
                        JOIN customers c ON o.customer_id = c.customer_id
                        JOIN pizzas p ON o.pizza_id = p.pizza_id
                        WHERE o.order_id = ?
                    `;

                    db.get(getOrderSql, [this.lastID], (err, order) => {
                        if (err) {
                            return res.status(500).json({
                                error: '获取订单详情失败: ' + err.message
                            });
                        }

                        res.status(201).json({
                            message: '订单创建成功',
                            order
                        });
                    });
                });
            });
        });
    });
};

/**
 * 获取所有订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getAllOrders = (req, res) => {
    const sql = `
        SELECT o.order_id, o.quantity, o.total_price, o.status, o.order_date,
               c.customer_id, c.name as customer_name, c.email, c.phone,
               p.pizza_id, p.name as pizza_name, p.description, p.size
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN pizzas p ON o.pizza_id = p.pizza_id
        ORDER BY o.order_date DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: '获取订单列表失败: ' + err.message
            });
        }

        res.json({
            count: rows.length,
            orders: rows
        });
    });
};

/**
 * 根据ID获取单个订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getOrderById = (req, res) => {
    const orderId = req.params.id;

    const sql = `
        SELECT o.order_id, o.quantity, o.total_price, o.status, o.order_date,
               c.customer_id, c.name as customer_name, c.email, c.phone, c.address,
               p.pizza_id, p.name as pizza_name, p.description, p.size, p.price as unit_price
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN pizzas p ON o.pizza_id = p.pizza_id
        WHERE o.order_id = ?
    `;

    db.get(sql, [orderId], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: '获取订单信息失败: ' + err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                error: '订单不存在'
            });
        }

        res.json(row);
    });
};

/**
 * 获取特定客户的所有订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getOrdersByCustomer = (req, res) => {
    const customerId = req.params.customer_id;

    // 先验证客户是否存在
    db.get('SELECT customer_id FROM customers WHERE customer_id = ?', [customerId], (err, customer) => {
        if (err) {
            return res.status(500).json({
                error: '验证客户信息失败: ' + err.message
            });
        }

        if (!customer) {
            return res.status(404).json({
                error: '客户不存在'
            });
        }

        const sql = `
            SELECT o.order_id, o.quantity, o.total_price, o.status, o.order_date,
                   p.name as pizza_name, p.description, p.size
            FROM orders o
            JOIN pizzas p ON o.pizza_id = p.pizza_id
            WHERE o.customer_id = ?
            ORDER BY o.order_date DESC
        `;

        db.all(sql, [customerId], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: '获取客户订单失败: ' + err.message
                });
            }

            res.json({
                customer_id: parseInt(customerId),
                count: rows.length,
                orders: rows
            });
        });
    });
};

/**
 * 更新订单状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // 验证状态字段
    if (!status) {
        return res.status(400).json({
            error: 'status 字段是必填的'
        });
    }

    // 验证状态值
    const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: '状态必须是: ' + validStatuses.join(', ')
        });
    }

    const sql = 'UPDATE orders SET status = ? WHERE order_id = ?';

    db.run(sql, [status, orderId], function(err) {
        if (err) {
            return res.status(500).json({
                error: '更新订单状态失败: ' + err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: '订单不存在'
            });
        }

        // 获取更新后的订单信息
        const getOrderSql = `
            SELECT o.order_id, o.quantity, o.total_price, o.status, o.order_date,
                   c.name as customer_name, p.name as pizza_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            JOIN pizzas p ON o.pizza_id = p.pizza_id
            WHERE o.order_id = ?
        `;

        db.get(getOrderSql, [orderId], (err, order) => {
            if (err) {
                return res.status(500).json({
                    error: '获取订单详情失败: ' + err.message
                });
            }

            res.json({
                message: '订单状态更新成功',
                order
            });
        });
    });
};

/**
 * 删除订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteOrder = (req, res) => {
    const orderId = req.params.id;

    const sql = 'DELETE FROM orders WHERE order_id = ?';

    db.run(sql, [orderId], function(err) {
        if (err) {
            return res.status(500).json({
                error: '删除订单失败: ' + err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: '订单不存在'
            });
        }

        res.json({
            message: '订单删除成功'
        });
    });
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByCustomer,
    updateOrderStatus,
    deleteOrder
};