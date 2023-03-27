import Product from '../models/product.js'

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing : false
  });
};

const postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title : title,
    imageUrl : imageUrl,
    price : price,
    description : description,
    userId : req.user
  });
  product.save()
  .then(()=>{
    console.log("Product Created");
    res.redirect('/');
  })
  .catch((err)=>{
    console.log(err);
  })
};

const getProducts = (req, res, next) => {
  Product.find()
    .then(products =>{
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err=>{
      console.log(err);
    })
};

const editProduct =(req,res,next)=>{
  const prodId = req.params.productId;
  const editing = req.query.editing;
  Product.findById(prodId)
  .then(product=>{
      if(!product){
        res.redirect('/');
      }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/edit-product',
      editing : editing,
      product : product
    })
  })
  .catch(err => console.log(err));
}

const updateProduct = (req,res,next)=>{
  const prodId= req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.findById(prodId.trim()).then(product =>{
     product.title = updatedTitle;
     product.price = updatedPrice;
     product.imageUrl = updatedImageUrl;
     product.description = updatedDescription
     product.userId = req.user;
     return product.save()
  })
    .then(result =>{
      console.log("PRODUCT UPDATED");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
}

const postDeleteProduct  =(req,res,next)=>{
   const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(result =>{
      console.log("PRODUCT DELETED");
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}
export default({getAddProduct,postAddProduct,getProducts,editProduct,
                  updateProduct,postDeleteProduct});