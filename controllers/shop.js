import Product from '../models/product.js'
import Order from '../models/order.js'

const getProducts = (req, res, next) => {
  Product.find()
  // .populated('userId','name')
  // .select('title price -_id')
  .then(products =>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => console.log(err));
};

const getIndex = (req, res, next) => {

  Product.find()
    .then(products =>{
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

 const getCart = (req, res, next) => {
      req.user
      .populate('cart.items.productId')
      .then(users =>{
        const products = users.cart.items
      res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
           products :products
        });
      })
          .catch(err => console.log(err));
}

const addCart = (req,res,next)=>{
  const prodId = req.body.prodId;
  Product.findById(prodId).then(product => {
    console.log(product);
    return req.user.addToCart(product);
  }).then(result =>{
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
  
}

const getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id}).then(orders =>{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders:orders
    });
  })
  .catch(err=>console.log(err));
};

const getProductDetails = (req,res,next)=>{
  const id = req.params.product;
   Product.findById(id)
   .then((product)=>{
    console.log(product);
    res.render('shop/product-detail',{
      product:product,
      pageTitle:"Details",
      path:'/products'
    })
   })
   .catch((err)=>{
    console.log(err);
   })
}

const postCartDeleteProduct =(req,res,next)=>{
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result=>{
    res.redirect('/cart');
  })
  .catch(err=> console.log(err));
}

const postOrder =(req,res,next)=>{
  req.user
      .populate('cart.items.productId')
      .then(users =>{
        const products = users.cart.items.map(i=>{
          return {quantity : i.quantity, product : {...i.productId._doc}}
        });
        const order = new Order({
          user :{
            name : req.user.name,
            userId :req.user
          },
          products : products 
        });
       return order.save()
      })
      .then(result=>{
        return req.user.clearCart();
      })
      .then((result)=>{
        res.redirect('/orders');
      })
      .catch(err=> console.log(err));
}

export default {getProducts,getIndex,getProductDetails,addCart,getCart,
  postCartDeleteProduct,postOrder,getOrders};