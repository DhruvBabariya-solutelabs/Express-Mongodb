import express from 'express';
import isAuth from '../middleware/is-auth.js';
import adminController from '../controllers/admin.js';
import {body} from 'express-validator';

const router = express.Router();

router.get('/edit-products/:productId',isAuth,adminController.editProduct);

router.get('/edit-product',isAuth, adminController.getAddProduct);

router.get('/products',isAuth, adminController.getProducts);

router.post('/edit-product',
[
    body('title').isString()
    .isLength({min: 3}).trim(),
    body('price').isFloat(),
    body('description')
    .isLength({min : 5, max :400})
    .trim()
],
isAuth, adminController.postAddProduct);

router.post('/update-product',
[
    body('title').isString()
    .isLength({min: 3})
    .trim(),
    body('price').isFloat(),
    body('description')
    .isLength({min : 5, max :400})
    .trim()
],
isAuth,adminController.updateProduct);

router.delete('/delete-product/:productId',isAuth,adminController.postDeleteProduct);

export default  {router};
