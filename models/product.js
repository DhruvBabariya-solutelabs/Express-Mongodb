import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const productSchema = new Schema({

  title :{
    type: String,
    required : true
  },
  price :{
    type : Number,
    required : true
  },
  description :{
    type : String,
    required:true
  },
  imageUrl :{
    type : String,
    required : true
  },
  userId :{
    type : Schema.Types.ObjectId,
    ref : 'User',
    required : true
  }
})

export default mongoose.model("Product",productSchema);
// import getDb from '../util/database.js';
// import mongodb from 'mongodb';

// class Product{
//   constructor(title,price,imageUrl,description,id,userId){
//     this.title =title;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     if(id){
//     this.id = id;
//     }else{
//       this.id;
//     }
//     this.userId = userId
//   }

//   save(){
//     const db = getDb.getDb();
//     if(this.id){
//       console.log(this.id);
//       return db.collection('product')
//       .updateOne({_id : new mongodb.ObjectId(this.id.trim())},{$set : this})
//       .then((result) => {
//         console.log("updated");
//         return result;
//       })
//       .catch(err => console.log(err));
//     }else{
//       console.log(this.userId);
//       return db.collection('product')
//       .insertOne(this)
//       .then(() => {
//         console.log("Inserted");
//       })
//       .catch(err => console.log(err));
//     }
    
//   }

//   static fetchAll(){
//     const db = getDb.getDb();
//     return db.collection('product').find().toArray()
//     .then(products=>{
//       console.log("Fetch all products");
//       return products;
//     })
//     .catch(err=> console.log(err));
//   }

//   static fetchById(prodId){
//     const db = getDb.getDb();
//     return db.collection('product')
//     .find({_id : new mongodb.ObjectId(prodId)}).next()
//     .then(product =>{
//       console.log("Fetch One Product");
//       return product;
//     })
//     .catch(err => console.log(err));
//   }

//   static deleteById(prodId){
//     const db = getDb.getDb();
//     return db.collection('product')
//     .deleteOne({_id : new mongodb.ObjectId(prodId)})
//     .then(result=>{
//       console.log("deleted");
//       return result;
//     })
//     .catch(err => console.log(err));
//   }
// }

// export default Product;