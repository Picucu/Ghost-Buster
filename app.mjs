import express from 'express';
import './db.mjs'
import mongoose from 'mongoose';
const  Kitchen = mongoose.model('Kitchen')
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

app.get('/',async (req, res) =>{
    let brands = '';
    try{
        brands = await Brands.find({}).sort('-createdAt');
    }catch{
        brands={};
    }
    res.render("table.hbs",{brand:brands});
})
app.get('/addnew', (req,res)=>{
    res.render('newBrand.hbs');
});

app.post('/addnew', async (req,res)=>{
    let poster = await User.find({name:"admin"}).catch(err => res.status(500).send('no admin error'));
    let brand = new Brands({
        user:[poster[0]['_id']],
        Locations:[req.body.BrandLocation],
        name:req.body.BrandName,
        description:req.body.descp,
        tscore:50
    })
    brand.save().then(saved => res.redirect('/')).catch(err =>res.status(500).send('server error'))
})

app.listen(process.env.PORT || 3000);

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