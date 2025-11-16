const db = require('../db');

/**
 * 客户控制器 - 处理所有客户相关的业务逻辑
 */

/**
 * 创建新客户
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const createCustomer = (req, res) => {
    const { name, email, phone, address } = req.body;

    // 验证必填字段
    if (!name || !email || !phone || !address) {
        return res.status(400).json({
            error: '必填字段: name, email, phone, address'
        });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: '邮箱格式不正确'
        });
    }

    const sql = `INSERT INTO customers (name, email, phone, address) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [name, email, phone, address], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    error: '邮箱地址已存在'
                });
            }
            return res.status(500).json({
                error: '创建客户失败: ' + err.message
            });
        }

        res.status(201).json({
            message: '客户创建成功',
            customer: {
                customer_id: this.lastID,
                name,
                email,
                phone,
                address
            }
        });
    });
};

/**
 * 获取所有客户
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getAllCustomers = (req, res) => {
    const sql = `SELECT customer_id, name, email, phone, address, created_at 
                 FROM customers 
                 ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: '获取客户列表失败: ' + err.message
            });
        }

        res.json({
            count: rows.length,
            customers: rows
        });
    });
};

/**
 * 根据ID获取单个客户
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getCustomerById = (req, res) => {
    const customerId = req.params.id;

    const sql = `SELECT customer_id, name, email, phone, address, created_at 
                 FROM customers 
                 WHERE customer_id = ?`;

    db.get(sql, [customerId], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: '获取客户信息失败: ' + err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                error: '客户不存在'
            });
        }

        res.json(row);
    });
};

/**
 * 更新客户信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updateCustomer = (req, res) => {
    const customerId = req.params.id;
    const { name, email, phone, address } = req.body;

    // 验证必填字段
    if (!name || !email || !phone || !address) {
        return res.status(400).json({
            error: '所有字段都是必填的: name, email, phone, address'
        });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: '邮箱格式不正确'
        });
    }

    const sql = `UPDATE customers 
                 SET name = ?, email = ?, phone = ?, address = ? 
                 WHERE customer_id = ?`;

    db.run(sql, [name, email, phone, address, customerId], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    error: '邮箱地址已存在'
                });
            }
            return res.status(500).json({
                error: '更新客户失败: ' + err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: '客户不存在'
            });
        }

        res.json({
            message: '客户信息更新成功',
            customer: {
                customer_id: parseInt(customerId),
                name,
                email,
                phone,
                address
            }
        });
    });
};

/**
 * 删除客户
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteCustomer = (req, res) => {
    const customerId = req.params.id;

    const sql = 'DELETE FROM customers WHERE customer_id = ?';

    db.run(sql, [customerId], function(err) {
        if (err) {
            return res.status(500).json({
                error: '删除客户失败: ' + err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: '客户不存在'
            });
        }

        res.json({
            message: '客户删除成功'
        });
    });
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};