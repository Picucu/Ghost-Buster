import mongoose from "mongoose";

const mongooseOpts = {
    useNewUrlParser: true,  
    useUnifiedTopology: true
  };
  
  mongoose.connect('mongodb://localhost/proj_ghost', mongooseOpts).then(console.log('Connected')).catch(err => console.log(err));

const User = new mongoose.Schema({
    username:String,
    password:String,
    posts:[KitchenSchema,BrandSchema],
    cscore:Number
})
const KitchenSchema = new mongoose.Schema({
    user:[User],
    name:String,
    Brands:[BrandSchema],
    timestamps: true,
    tScore:Number
})
const BrandSchema = new mongoose.Schema({
    user:[User],
    name:String,
    Locations:String,
    timestamps: true,
    tscore:Number
})
mongoose.model('user', User);
mongoose.model('Kitchen', KitchenSchema);
mongoose.model('Brand', BrandSchema);