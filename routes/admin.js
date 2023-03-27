import express from 'express';

import adminController from '../controllers/admin.js';

const router = express.Router();

// /admin/add-product => GET

 router.get('/edit-products/:productId',adminController.editProduct);

router.get('/edit-product', adminController.getAddProduct);

// /admin/products => GET
 router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/edit-product', adminController.postAddProduct);

router.post('/update-product',adminController.updateProduct);

router.post('/delete-product',adminController.postDeleteProduct);




export default  {router};
