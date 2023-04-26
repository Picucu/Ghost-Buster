import express from 'express';
import './db.mjs'
import mongoose from 'mongoose';
import sanitize from 'mongoose-sanitize';
import bcrypt from 'bcrypt';
import session from 'express-session';
import './auth.js'
import passport from 'passport';
const app = express();

import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');

const Brands = mongoose.model('Brand');
const User = mongoose.model('user');
const Kitchens = mongoose.model('Kitchen')

app.use(express.urlencoded({ extended: false }));

const sessionOptions = {
  secret:'qDd2F:_Xp_Oozp/o6i(hFr>#FcO$g%',
  resave: true,
  saveUninitialized: true
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});
/* TODO: ADD CLIENT SIDE FORM VALIDATION */
/* TODO: ADD GOOGLE MAPS FEATURE */


//Main Page router
app.get('/',async (req, res) =>{
    /*TODO: ADD SEARCH FUNCTION*/
    let brands = '';
    let kitchens = '';
    try{
        brands = await Brands.find({}).sort('-createdAt');
    }catch{
        brands={};
    }
    try{
      kitchens = await Kitchens.find({}).populate('Brands','name').sort('-createdAt');
    }catch{
        kitchens = {};
    }
    console.log('REQ.USER: ',req.user)
    console.log('REQ.LOCALS: ',req.locals)
    res.render("table.hbs",{brand:brands,kitchen:kitchens,user:req.user});
});



/* 
  TODO:
  ADD ROUTE HANDLER FOR /verify
  AND Add score update feature

  NOTE: Imma have to write some bullllshit scoring algo, and I have no fucking idea what im even gonna do
  NOTE NOTE: send help


*/

/* TODO: ADD INDIVIDUAL PAGE FOR USER */

//Login handler

app.get('/login', async(req,res)=>{

    res.render("login.hbs")
});

//Some magic shit happens here I have no fucking idea how it authenticates
app.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    console.log('USER: ', user)
    if(user) {
      req.logIn(user, function(err) {
        res.redirect('/');
      });
    } else {
      res.render('login', {message:'Your login or password is incorrect.'});
    }
  })(req, res, next);
});
//End of magic shit


//Registration Handler

app.get('/register', async(req,res)=>{
    res.render("register.hbs")
});

app.post('/register', async(req,res)=>{
  User.register(new User({username:req.body.username}), req.body.password, 
  function(err, user){
    if(err){
      res.render('register',{message:'Invalid Registration'});
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  })
})

//Routes Add new Brand Page and handles form submittions form the same page

app.get('/addnew', (req,res)=>{
    res.render('newBrand.hbs');
    console.log(req.user)
});

app.post('/addnew', async (req,res)=>{
    /*TODO: Add test condition to see if Brand is already in the  mongo Database.
    NOTE: The names of the brands should be normalized/ use slugs if possible
    True: Add new location to brand locations array if the location is new and see if a kitchen exists in the database at that location, if true, add this brand ID into Kitchen's Brands array .Update poster stats by adding brand ID into poster's brandposts array.
    False: Create new entry,  Update poster stats, Update Kitchen
    */
    let brandExists = await Brands.findOne({name:req.body.BrandName, Locations:req.body.BrandLocation});
    if(brandExists){
      //Add new location to brand locations array if the location is new
      if(!brandExists.Locations.includes(req.body.BrandLocation)){
        brandExists.Locations.push(req.body.BrandLocation);
      }
      await brandExists.save();
      //see if a kitchen exists in the database at that location
      let kitchenExists = await Kitchens.findOne({location:req.body.BrandLocation});
      if(kitchenExists){
        //if true, add this brand ID into Kitchen's Brands array
        if(!kitchenExists.Brands.includes(brandExists['_id'])){
          kitchenExists.Brands.push(brandExists['_id']);
        }
        await kitchenExists.save();
      }else{
        //Create new kitchen
        let kitchen = new Kitchens({
          location:req.body.BrandLocation,
          Brands:[brandExists['_id']]
        });
        //save new kitchen database entry
        kitchen.save().then(saved => console.log('saved')).catch(err =>res.status(500).send('server error'));
      }
      //Update poster stats by adding brand ID into poster's brandposts array.
      res.user.Brands.push(brandExists['_id']);

      res.redirect('/')
    }else{
    //Create new Brand entry
    let brand = new Brands({
        user:[req.user['_id']],
        Locations:[req.body.BrandLocation],
        name:req.body.BrandName,
        description:req.body.descp,
        tscore:50
    })
    //save new brand database entry
    brand.save().then(saved => res.redirect('/')).catch(err =>res.status(500).send('server error'));
    }
});

//Routes Add new Kitchen Page and handles form submissions from the same page

app.get('/addnewKitchen', (req,res)=>{
  res.render('newKitchen.hbs');
});



app.post('/addnewKitchen', async (req,res)=>{
    //Finds brand at location sent by user
    let brandsOfLoc = await Brands.find({Locations: req.body.KitchenLocation})
    //Extract Brand ID into an array
    let brandIds = brandsOfLoc.map(brand =>{
      return brand._id
    });

    /* TODO:
      Check if already exists: (by loation)
      True: Only add to User stats
      False: Make new
    */

    //Create New kitchen
    let Kitchen = new Kitchens({
      user:[req.user['_id']],
      Location:req.body.KitchenLocation,
      Brands:brandIds,
      name:req.body.KitchenName,
      tscore:50
    });
    Kitchen.save().then(saved => res.redirect('/')).catch(err =>{
      res.status(500).send('server error') 
      console.log(err)
    });
});

/* TODO: ADD INDIVIDUAL PAGE FOR BRAND */

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


app.listen(process.env.PORT ?? 3000);

/* 
code snippet for addin basic markers, I have the api key still figuring out how to do this

just found out that google maps has a webgl version of the map now! I want to integrate this into the site, it looks very cool.

// Initialize and add the map
let map;

async function initMap() {
  // The location of Uluru
  const position = { lat: -25.344, lng: 131.031 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerView({
    map: map,
    position: position,
    title: "Uluru",
  });
}

initMap();
*/