import Product from "../models/product.js";
import { validationResult } from "express-validator";
import deleteFile from "../util/file.js";
import order from "../models/order.js";

const getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

const postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Please enter valid image type",
      validationErrors: [],
    });
  }
  const imageUrl = image.path;
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  product
    .save()
    .then(() => {
      console.log("Product Created");
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      return next(err);
    });
};
const ITEM_PER_PAGE = 3;
const getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItem;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItem = numProducts;
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItem,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItem / ITEM_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);

      return next(error);
    });
};

const editProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const editing = req.query.editing;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/edit-product",
        editing: editing,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

const updateProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId.trim())
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDescription;
      product.userId = req.user;
      return product.save();
    })
    .then((result) => {
      console.log("PRODUCT UPDATED");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

const postDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product Not Found"));
      }
      //deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId });
    })
    .then((result) => {
      console.log(result);
      console.log("PRODUCT DELETED");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      return next(error);
    });
};
const getAllOrders = (req, res, next) => {
  order
    .find()
    .populate("user.userId")
    .then((orders) => {
      res.render("admin/listoforders", {
        pageTitle: "All orders",
        path: "/admin/listoforders",
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true,
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      return next(error);
    });
};
export default {
  getAddProduct,
  postAddProduct,
  getProducts,
  editProduct,
  updateProduct,
  postDeleteProduct,
  getAllOrders,
};
