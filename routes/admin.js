import express from 'express';
import isAuth from '../middleware/is-auth.js';
import adminController from '../controllers/admin.js';

const router = express.Router();

router.get('/edit-products/:productId',isAuth,adminController.editProduct);

router.get('/edit-product',isAuth, adminController.getAddProduct);

router.get('/products',isAuth, adminController.getProducts);

router.post('/edit-product',isAuth, adminController.postAddProduct);

router.post('/update-product',isAuth,adminController.updateProduct);

router.post('/delete-product',isAuth,adminController.postDeleteProduct);

export default  {router};
