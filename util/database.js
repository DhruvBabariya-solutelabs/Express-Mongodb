import mongodb from 'mongodb'

const mongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback)=>{
    mongoClient.connect(
        'mongodb+srv://dhruvbabariya912001:1Qgtr12DHk0qWzqr@firstcluster.hexiesz.mongodb.net/shop?retryWrites=true&w=majority')
    
        .then(client=>{
            _db = client.db();
            console.log("Connected");
            callback();
        })
        .catch(err=> console.log(err));
}

const getDb = ()=>{
    if(_db){
        return _db;
    }
    throw "No Database Found!!";
}

export default {mongoConnect,getDb};
