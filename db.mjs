import mongoose from "mongoose";
import slug from 'mongoose-slug-updater';
import passportLocalMongoose from 'passport-local-mongoose';
// is the environment variable, NODE_ENV, set to PRODUCTION? 
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://127.0.0.1:27017/finalproj';
}




const mongooseOpts = {
    useNewUrlParser: true,  
    useUnifiedTopology: true
  };
  
  mongoose.connect(dbconf, mongooseOpts).then(console.log('Connected')).catch(err => console.log(err));


mongoose.plugin(slug);



const User = new mongoose.Schema({
    kitchenposts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Kitchen'}],
    brandposts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Brand'}],
    cscore:Number
})
//Enable passport plugin
User.plugin(passportLocalMongoose);

const KitchenSchema = new mongoose.Schema({
    user:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    name:String,
    Location:String,
    Brands:[{type: mongoose.Schema.Types.ObjectId, ref: 'Brand'}],
    slug: {type: String, slug: 'name', unique: true},
    tScore:Number
},{timestamps: true})
const BrandSchema = new mongoose.Schema({
    user:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    name:String,
    Locations:[{type:String}],
    description: {type: String, required: false},
    slug: {type: String, slug: 'name', unique: true},
    tscore:Number
},{timestamps: true})
mongoose.model('user', User);
mongoose.model('Kitchen', KitchenSchema);
mongoose.model('Brand', BrandSchema);