import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "User",
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId == product.id;
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { item: [] };
  return this.save();
};
export default mongoose.model("User", userSchema);

// import getDb from '../util/database.js';
// import mongodb from 'mongodb';

// let objectId = mongodb.ObjectId;
// class User{
//     constructor(username,email,cart, id){
//         this.name = username;
//         this.email = email;
//         this.cart =cart
//         this._id = id;
//     }

//     save(){
//         const db = getDb.getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product){

//         const cartProductIndex = this.cart.item.findIndex(cp =>{
//             return cp.productId == product.id;
//         })
//         console.log(cartProductIndex);
//         let newQuantity =1;
//         const updatedCartItems = [...this.cart.item];
//         if(cartProductIndex >= 0){
//             newQuantity = this.cart.item[cartProductIndex].quantity +1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }else{
//             updatedCartItems.push({productId : new objectId(product._id),quantity :newQuantity})
//         }
//         const updatedCart ={
//             item :updatedCartItems
//         };
//         const db =getDb.getDb();
//         db.collection('users').updateOne({_id : new objectId(this._id)},
//         {$set : {cart : updatedCart}});
//     }

//     static findById(userId){
//         const db = getDb.getDb();
//         return db.collection('users').findOne({_id : new objectId(userId)})
//         .then(result =>{
//             return result;
//         })
//         .catch(err => console.log(err));
//     }

//     getCart(){
//        const db = getDb.getDb();
//        const  productIds = this.cart.item.map(i =>{return i.productId});
//        console.log(productIds);
//        return db.collection('product').find({ _id: { $in : productIds}}).toArray()
//        .then(products => {
//         console.log(products);
//         return products.map(p=>{
//             return {...p,quantity:this.cart.item.find(i=>{
//                 return i.productId.toString() === p._id.toString();
//             }).quantity
//         }
//         })
//        })
//     }
//     deleteItemFromCart(productId){
//         const updatedCartItems = this.cart.item.filter(item =>{
//             return item.productId.toString() !== productId.toString();
//         });
//         const db =getDb.getDb();
//        return db.collection('users').updateOne({_id : new objectId(this._id)},
//         {$set : {cart : {item : updatedCartItems}}});

//     }

//     addOrder(){
//         const db = getDb.getDb();
//         return this.getCart().then(products =>{
//             const order ={
//             item: products,
//             users :{
//                 _id: new objectId(this._id),
//                 name : this.name,
//             }
//         }
//         return db.collection('orders').insertOne(order);
//         })
//         .then(result =>{
//             this.cart = {item : []};
//             return db.collection('users').updateOne(
//                 {_id : new objectId(this._id)},
//                 {$set : {cart : {item :[]}}}
//             )
//         })

//     }

//     getOrders(){
//         const db = getDb.getDb();
//         return db.collection('orders')
//         .find({'users._id': new objectId(this._id)}).toArray()
//     }
// }

// export default User;
