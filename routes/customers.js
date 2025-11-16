const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');

/**
 * 客户路由配置
 * 所有路由都以 /api/customers 为前缀
 */

// POST /api/customers - 创建新客户
router.post('/', createCustomer);

// GET /api/customers - 获取所有客户
router.get('/', getAllCustomers);

// GET /api/customers/:id - 根据ID获取单个客户
router.get('/:id', getCustomerById);

// PUT /api/customers/:id - 更新客户信息
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - 删除客户
router.delete('/:id', deleteCustomer);

module.exports = router;