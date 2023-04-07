import mongoose from "mongoose";
import slug from 'mongoose-slug-updater';

const mongooseOpts = {
    useNewUrlParser: true,  
    useUnifiedTopology: true
  };
  
  mongoose.connect('mongodb://127.0.0.1:27017/finalproj', mongooseOpts).then(console.log('Connected')).catch(err => console.log(err));


mongoose.plugin(slug);


const User = new mongoose.Schema({
    username:{type: String, required: true, minLength: 3, maxLength: 20},
    password:{type: String, required: true, minLength: 8},
    kitchenposts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Kitchen'}],
    brandposts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Brand'}],
    cscore:Number
})
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