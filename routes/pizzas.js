const express = require('express');
const router = express.Router();
const {
    createPizza,
    getAllPizzas,
    getPizzaById,
    updatePizza,
    deletePizza
} = require('../controllers/pizzaController');

/**
 * 披萨路由配置
 * 所有路由都以 /api/pizzas 为前缀
 */

// POST /api/pizzas - 创建新披萨
router.post('/', createPizza);

// GET /api/pizzas - 获取所有披萨
router.get('/', getAllPizzas);

// GET /api/pizzas/:id - 根据ID获取单个披萨
router.get('/:id', getPizzaById);

// PUT /api/pizzas/:id - 更新披萨信息
router.put('/:id', updatePizza);

// DELETE /api/pizzas/:id - 删除披萨
router.delete('/:id', deletePizza);

module.exports = router;