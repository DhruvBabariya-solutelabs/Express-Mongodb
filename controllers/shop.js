import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import stripe from "stripe";
import Product from "../models/product.js";
import Order from "../models/order.js";
import dotenv from "dotenv";

dotenv.config();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

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
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
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
      error.httpStatusCode(500);
      return next(error);
    });
};

const getIndex = (req, res, next) => {
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
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
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
      error.httpStatusCode(500);
      return next(error);
    });
};

const getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((users) => {
      const products = users.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const addCart = (req, res, next) => {
  const prodId = req.body.prodId;
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const getProductDetails = (req, res, next) => {
  const id = req.params.product;
  Product.findById(id)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Details",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((users) => {
      products = users.cart.items;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      console.log("Inside getCheckout");
      return stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((product) => {
          return {
            price_data: {
              currency: "inr",
              unit_amount: product.productId.price * 100,
              product_data: {
                name: product.productId.title,
                description: product.productId.description,
              },
            },
            quantity: product.quantity,
          };
        }),
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => {
      console.log("session created success");
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      return next(error);
    });
};

const getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((users) => {
      const products = users.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
};

const getInvoices = (req, res, next) => {
  const orderid = req.params.orderId;

  Order.findById(orderid)
    .then((order) => {
      if (!order) {
        return next(new Error("No Order Found"));
      }
      // if (order.user.userId.toString() !== req.user._id.toString()) {
      //   return next("Unauthorized");
      // }
      const invoiceName = "invoice-" + orderid + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline: filename ="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "Rs. " +
              prod.product.price
          );
      });
      pdfDoc.text("---------------------------");
      pdfDoc.fontSize(20).text("Total Price: Rs. " + totalPrice);
      pdfDoc.end();
    })
    .catch((err) => next(err));
};

export default {
  getProducts,
  getIndex,
  getProductDetails,
  addCart,
  getCart,
  postCartDeleteProduct,
  getCheckoutSuccess,
  getOrders,
  getInvoices,
  getCheckout,
};
