The content below is an example project proposal / requirements document. Replace the text below the lines marked "__TODO__" with details specific to your project. Remove the "TODO" lines.

# Ghost Restaurant Records

## Overview

I don't like Ghost restaurants. A ghost restaurant is a restaurant or restaurant chain that doesnt have a physical storefront and is usually sold out of giant cooking complexes which can host up to a dozen of these ghost restaurants. These restuarants try their best to hide that they are infact ghost restaurants and it is very hard to find these industrial kitchen complexes which usually are located in unmarked buildings. These ghost resturants also escape safety and allergen testing by the government and do not follow guidelines. So this is a site which allow users to upload and locate ghost resturant brands and industrial kitchen locations. Users will need to create a profile and log in to suggest location/brands, which will be stored on a mongo database. Users will also be able to rate and verify these brands and locations which other users have recommened. If a user if found to have suggested many incorrect brands/locations, their internal "credit score" will de decreased and the system may not register/show their next suggestions. The site will then allow users to search through these different brands and industrial kitchens to see what is in their local area. (google maps integration?)



## Data Model

(__TODO__: a description of your application's data and their relationships to each other) 

The application will store Users, Brands and Kitchens

* users can have multiple listings of Brands/Kitchens (via references)
* Kitchens will have restaurants (via references)

(__TODO__: sample documents)

An Example User:

```javascript
{
  username: "shannonshopper",
  hash: // a password hash,
  posts: // an array of Brands/kitechens the user has posted
  cscore: //a number which is determined by the amount of positive/ negative verifications the user has recived
}
```

An Example Kitchen:

```javascript
{
  user: // a reference to a User object
  name: "Bib",
  Brands: //array of brands which oprate at this location,
  createdAt: // timestamp
  tscore://Score which dictates the accuracy and how trusted this posting is
}
```
An Example Brand:
```javascript
{
  user: // a reference to a User object
  name: "Burgerburger",
  Locations: //array of location which host this brand,
  createdAt: // timestamp
  tscore://Score which dictates the accuracy and how trusted this posting is
}
```


## [Link to Commented First Draft Schema](db.mjs) 

(__TODO__: create a first draft of your Schemas in db.mjs and link to it)

## Wireframes

(__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

(__TODO__: draw out a site map that shows how pages are related to each other)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

(__TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://en.wikipedia.org/wiki/Use_case))

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can create a new grocery list
4. as a user, I can view all of the grocery lists I've created in a single list
5. as a user, I can add items to an existing grocery list
6. as a user, I can cross off items in an existing grocery list

## Research Topics

(__TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit)


## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)

