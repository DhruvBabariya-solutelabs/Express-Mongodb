import express from 'express';

import shopController from '../controllers/shop.js'

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/product/:product',shopController.getProductDetails);

router.get('/cart', shopController.getCart);

router.post('/add-to-cart',shopController.addCart);

router.post('/create-order',shopController.postOrder);

router.get('/orders', shopController.getOrders);

router.post('/cart-delete-item',shopController.postCartDeleteProduct);
export default {router};
