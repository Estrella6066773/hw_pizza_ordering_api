const db = require('../db');

/**
 * 披萨控制器 - 处理所有披萨相关的业务逻辑
 */

/**
 * 创建新披萨
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const createPizza = (req, res) => {
    const { name, description, price, size } = req.body;

    // 验证必填字段
    if (!name || !price || !size) {
        return res.status(400).json({
            error: '必填字段: name, price, size'
        });
    }

    // 验证价格
    if (price <= 0) {
        return res.status(400).json({
            error: '价格必须大于0'
        });
    }

    // 验证尺寸
    const validSizes = ['小', '中', '大'];
    if (!validSizes.includes(size)) {
        return res.status(400).json({
            error: '尺寸必须是: 小, 中, 大'
        });
    }

    const sql = `INSERT INTO pizzas (name, description, price, size) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [name, description || '', price, size], function(err) {
        if (err) {
            return res.status(500).json({
                error: '创建披萨失败: ' + err.message
            });
        }

        res.status(201).json({
            message: '披萨创建成功',
            pizza: {
                pizza_id: this.lastID,
                name,
                description: description || '',
                price,
                size
            }
        });
    });
};

/**
 * 获取所有披萨
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getAllPizzas = (req, res) => {
    const sql = `SELECT pizza_id, name, description, price, size, created_at 
                 FROM pizzas 
                 ORDER BY name, size`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: '获取披萨列表失败: ' + err.message
            });
        }

        res.json({
            count: rows.length,
            pizzas: rows
        });
    });
};

/**
 * 根据ID获取单个披萨
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getPizzaById = (req, res) => {
    const pizzaId = req.params.id;

    const sql = `SELECT pizza_id, name, description, price, size, created_at 
                 FROM pizzas 
                 WHERE pizza_id = ?`;

    db.get(sql, [pizzaId], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: '获取披萨信息失败: ' + err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                error: '披萨不存在'
            });
        }

        res.json(row);
    });
};

/**
 * 更新披萨信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const updatePizza = (req, res) => {
    const pizzaId = req.params.id;
    const { name, description, price, size } = req.body;

    // 验证必填字段
    if (!name || !price || !size) {
        return res.status(400).json({
            error: 'name, price, size 是必填字段'
        });
    }

    // 验证价格
    if (price <= 0) {
        return res.status(400).json({
            error: '价格必须大于0'
        });
    }

    // 验证尺寸
    const validSizes = ['小', '中', '大'];
    if (!validSizes.includes(size)) {
        return res.status(400).json({
            error: '尺寸必须是: 小, 中, 大'
        });
    }

    const sql = `UPDATE pizzas 
                 SET name = ?, description = ?, price = ?, size = ? 
                 WHERE pizza_id = ?`;

    db.run(sql, [name, description || '', price, size, pizzaId], function(err) {
        if (err) {
            return res.status(500).json({
                error: '更新披萨失败: ' + err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: '披萨不存在'
            });
        }

        res.json({
            message: '披萨信息更新成功',
            pizza: {
                pizza_id: parseInt(pizzaId),
                name,
                description: description || '',
                price,
                size
            }
        });
    });
};

/**
 * 删除披萨
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deletePizza = (req, res) => {
    const pizzaId = req.params.id;

    // 检查披萨是否在订单中使用
    const checkSql = 'SELECT COUNT(*) as count FROM orders WHERE pizza_id = ?';

    db.get(checkSql, [pizzaId], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: '检查披萨使用情况失败: ' + err.message
            });
        }

        if (row.count > 0) {
            return res.status(409).json({
                error: '无法删除披萨，该披萨已被订单使用'
            });
        }

        const deleteSql = 'DELETE FROM pizzas WHERE pizza_id = ?';

        db.run(deleteSql, [pizzaId], function(err) {
            if (err) {
                return res.status(500).json({
                    error: '删除披萨失败: ' + err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: '披萨不存在'
                });
            }

            res.json({
                message: '披萨删除成功'
            });
        });
    });
};

module.exports = {
    createPizza,
    getAllPizzas,
    getPizzaById,
    updatePizza,
    deletePizza
};