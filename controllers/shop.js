import Product from '../models/product.js'

const getProducts = (req, res, next) => {
  Product.fetchAll()
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

  Product.fetchAll()
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
           req.user.getCart().then(products =>{
      
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
  Product.fetchById(prodId).then(product => {
    console.log(product);
    return req.user.addToCart(product);
  }).then(result =>{
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
  
}

const getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders=>{
    console.log(orders);
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
   Product.fetchById(id)
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
  req.user.deleteItemFromCart(prodId)
  .then(result=>{
    res.redirect('/cart');
  })
  .catch(err=> console.log(err));
}

const postOrder =(req,res,next)=>{
  req.user.addOrder()
  .then(result=>{
    res.redirect('/orders');
  })
  .catch(err=> console.log(err));
}

export default {getProducts,getIndex,getProductDetails,addCart,getCart,
  postCartDeleteProduct,postOrder,getOrders};