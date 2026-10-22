const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', protect, requireRole('Admin'), productController.createProduct);
router.put('/:id', protect, requireRole('Admin'), productController.updateProduct);
router.delete('/:id', protect, requireRole('Admin'), productController.deleteProduct);

module.exports = router;
