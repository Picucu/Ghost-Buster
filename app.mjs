import express from 'express';
import './db.mjs'
import mongoose from 'mongoose';
import sanitize from 'express-mongo-sanitize';
import bcrypt from 'bcrypt';
import session from 'express-session';
import './auth.js'
import passport from 'passport';
import fs from 'fs';
import http from 'http';
import https from 'https';
import favicon from 'serve-favicon';
var privateKey  = fs.readFileSync('localhost-key.pem', 'utf8');
var certificate = fs.readFileSync('localhost.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
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
app.use(sanitize({
  replaceWith: '_',
})
);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
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
      console.log(kitchens)
    }catch{
        kitchens = {};
    }
    res.render("table.hbs",{brand:brands,kitchen:kitchens,user:req.user});
});

app.post('/',async (req,res)=>{
  let brands = '';
  let kitchens = '';
    try{
        let searchname = req.body.search.trim().replace(/\s+/g, '-').toLowerCase();
        brands = await Brands.find({slug:searchname}).sort('-createdAt');
        let locations = brands[0].Locations;
        kitchens = await Promise.all(locations.map(async (location)=>{
          let kitchen = await Kitchens.find({Location:location}).populate('Brands','name').sort('-createdAt');
          return kitchen[0];
        }))
        console.log("SEARCHED KITCHENS: ",kitchens)
    }catch{
        brands={};
        kitchens = {};
    }

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
  if(req.user){
    res.render('newBrand.hbs');
  }else{
    res.redirect('/login');
  }
});

app.post('/addnew', async (req,res)=>{
    /*TODO: Add test condition to see if Brand is already in the  mongo Database.
    NOTE: The names of the brands should be normalized
    True: Add new location to brand locations array if the location is new and see if a kitchen exists in the database at that location, if true, add this brand ID into Kitchen's Brands array .Update poster stats by adding brand ID into poster's brandposts array.
    False: Create new entry,  Update poster stats, Update Kitchen
    */
    if(req.user){
      //normalize brand name
      let newBrandName = req.body.BrandName.trim().replace(/\s+/g, '-').toLowerCase();
      let brandExists = await Brands.findOne({slug:newBrandName});
    if(brandExists){
      //Add new location to brand locations array if the location is new
      if(!(brandExists.Locations.includes(req.body.BrandLocation))){
        brandExists.Locations.push(req.body.BrandLocation);
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
            user:[req.user['_id']],
            name:req.body.BrandLocation,
            Location:req.body.BrandLocation,
            Brands:[brandExists['_id']]
          });
          req.user.kitchenposts.push(kitchen['_id']);
          //save new kitchen database entry
          kitchen.save().then(saved => console.log('saved')).catch(err => req.status(500).send(err));
        }
        //Update poster stats by adding brand ID into poster's brandposts array.
          req.user.brandposts.push(brandExists['_id']);
          await req.user.save();

          res.redirect('/')
      }else{
        //if the location is already in the database, do nothing
        res.render('newBrand.hbs',{message:'Brand already exists'})
      }
      
      
    }else{
      //Create new Brand entry
      let brand = new Brands({
          user:[req.user['_id']],
          Locations:[req.body.BrandLocation],
          name:req.body.BrandName,
          description:req.body.descp,
          tscore:50
      })
      //see if a kitchen exists in the database at that location
      let kitchenExists = await Kitchens.findOne({location:req.body.BrandLocation});
      if(kitchenExists){
        //if true, add this brand ID into Kitchen's Brands array
        if(!kitchenExists.Brands.includes(brand['_id'])){
          kitchenExists.Brands.push(brand['_id']);
        }
        await kitchenExists.save();
      }else{
        //Create new kitchen
        let kitchen = new Kitchens({
          user:[req.user['_id']],
          name:req.body.BrandLocation,
          Location:req.body.BrandLocation,
          Brands:[brand['_id']]
        });
        //save new kitchen id into Poster kitchenposts array
        req.user.kitchenposts.push(kitchen['_id']);
        //save new kitchen database entry
        kitchen.save().then(saved => console.log('saved')).catch(err => req.status(500).send(err));
      }
      //save brand ID into poster's brandposts array.
      req.user.brandposts.push(brand['_id']);
      req.user.save().then(saved => console.log('saved')).catch(err => req.status(500).send(err));
      //save new brand database entry
      brand.save().then(saved => res.redirect('/')).catch(err => req.status(500).send(err));
      
    }
  }else{
    res.redirect('/login')
  }
});

//Routes Add new Kitchen Page and handles form submissions from the same page

app.get('/addnewKitchen', (req,res)=>{
  if(req.user){
    res.render('newKitchen.hbs');
  }else{
    res.redirect('/login')
  }
});



app.post('/addnewKitchen', async (req,res)=>{
    if(req.user){
    //Finds brand at location sent by user
    let brandsOfLoc = await Brands.find({Locations: req.body.KitchenLocation})
    //Extract Brand ID into an array
    let brandIds = brandsOfLoc.map(brand =>{
      return brand._id
    });

    /* TODO:
      Check if already exists: (by loation)
      True: redirect back to addnewKitchen page with error message
      False: Make new
    */
    if(brandsOfLoc.length <= 0){
      res.render('newKitchen.hbs',{message:'Kitchen already exists'})
    }else{
    //Create New kitchen
    let Kitchen = new Kitchens({
      user:[req.user['_id']],
      Location:req.body.KitchenLocation,
      Brands:brandIds,
      name:req.body.KitchenName,
      tscore:50
    });
    req.user.kitchenposts.push(Kitchen['_id']);
    req.user.save().then(saved => console.log('saved'));
    Kitchen.save().then(saved => res.redirect('/')).catch(err =>{
      res.status(500).send('server error') 
      console.log(err)
    });
    }
  }else{
    res.redirect('/login')
  }
});

/* TODO: ADD INDIVIDUAL PAGE FOR BRAND */

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);
//app.listen(process.env.PORT ?? 3000);

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