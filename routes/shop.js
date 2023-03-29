import express from 'express';
import isAuth from '../middleware/is-auth.js';
import shopController from '../controllers/shop.js'

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/product/:product',shopController.getProductDetails);

router.get('/cart',isAuth, shopController.getCart);

router.post('/add-to-cart',isAuth,shopController.addCart);

router.post('/create-order',isAuth,shopController.postOrder);

router.get('/orders',isAuth, shopController.getOrders);

router.post('/cart-delete-item',isAuth,shopController.postCartDeleteProduct);
export default {router};
