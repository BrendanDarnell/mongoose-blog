'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {Blogs, Authors} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function generateAuthorData() {
	return {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		userName: faker.internet.userName()
	}
}


function generateBlogData() {
	return {
		title: faker.lorem.words(),
		content: faker.lorem.paragraph(),
		// author: faker.name.lastName()
	}
}


function seedData () {
	let seedAuthors = [];
	let seedBlogs = [];
	let userNames = [];
	let userIds = [];

	for (let i=0; i<2; i++) {
		seedAuthors[i] = generateAuthorData();
		userNames[i] = seedAuthors[i].userName;
		// Authors.create(seedAuthors[i])
	}

	Authors.insertMany(seedAuthors)
	// .then(authors=>console.log(authors))
	.then(authors => {
		authors.forEach(author=> {
			userIds.push(author._id);
		});
		return userIds;
	})
	.then(userIds => {
		for (let i=0; i<userIds.length; i++) {
		seedBlogs.push(generateBlogData());
		seedBlogs[i].author = userIds[i];
		}
		return seedBlogs;
	})
	.then(seedBlogs => {
		return Blogs.insertMany(seedBlogs);
	})
	.then(blogs => {
		console.log(blogs)
		return blogs
	})
	.catch(err=>console.log("seed db failed to populate"))

}


function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}


describe('Blogs API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing blogs', function() {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/blogs')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          console.log(res.body.blogs);
          expect(res.body.length).to.be.at.least(1);
          return Blogs.count();
        })
        .then(function(count) {
          expect(res.body.blogs).to.have.lengthOf(count);
        });
    });


  //   it('should return restaurants with right fields', function() {
  //     // Strategy: Get back all restaurants, and ensure they have expected keys

  //     let resRestaurant;
  //     return chai.request(app)
  //       .get('/restaurants')
  //       .then(function(res) {
  //         expect(res).to.have.status(200);
  //         expect(res).to.be.json;
  //         expect(res.body.restaurants).to.be.a('array');
  //         expect(res.body.restaurants).to.have.lengthOf.at.least(1);

  //         res.body.restaurants.forEach(function(restaurant) {
  //           expect(restaurant).to.be.a('object');
  //           expect(restaurant).to.include.keys(
  //             'id', 'name', 'cuisine', 'borough', 'grade', 'address');
  //         });
  //         resRestaurant = res.body.restaurants[0];
  //         return Restaurant.findById(resRestaurant.id);
  //       })
  //       .then(function(restaurant) {

  //         expect(resRestaurant.id).to.equal(restaurant.id);
  //         expect(resRestaurant.name).to.equal(restaurant.name);
  //         expect(resRestaurant.cuisine).to.equal(restaurant.cuisine);
  //         expect(resRestaurant.borough).to.equal(restaurant.borough);
  //         expect(resRestaurant.address).to.contain(restaurant.address.building);

  //         expect(resRestaurant.grade).to.equal(restaurant.grade);
  //       });
  //   });
  // });

  // describe('POST endpoint', function() {
  //   // strategy: make a POST request with data,
  //   // then prove that the restaurant we get back has
  //   // right keys, and that `id` is there (which means
  //   // the data was inserted into db)
  //   it('should add a new restaurant', function() {

  //     const newRestaurant = generateRestaurantData();
  //     let mostRecentGrade;

  //     return chai.request(app)
  //       .post('/restaurants')
  //       .send(newRestaurant)
  //       .then(function(res) {
  //         expect(res).to.have.status(201);
  //         expect(res).to.be.json;
  //         expect(res.body).to.be.a('object');
  //         expect(res.body).to.include.keys(
  //           'id', 'name', 'cuisine', 'borough', 'grade', 'address');
  //         expect(res.body.name).to.equal(newRestaurant.name);
  //         // cause Mongo should have created id on insertion
  //         expect(res.body.id).to.not.be.null;
  //         expect(res.body.cuisine).to.equal(newRestaurant.cuisine);
  //         expect(res.body.borough).to.equal(newRestaurant.borough);

  //         mostRecentGrade = newRestaurant.grades.sort(
  //           (a, b) => b.date - a.date)[0].grade;

  //         expect(res.body.grade).to.equal(mostRecentGrade);
  //         return Restaurant.findById(res.body.id);
  //       })
  //       .then(function(restaurant) {
  //         expect(restaurant.name).to.equal(newRestaurant.name);
  //         expect(restaurant.cuisine).to.equal(newRestaurant.cuisine);
  //         expect(restaurant.borough).to.equal(newRestaurant.borough);
  //         expect(restaurant.grade).to.equal(mostRecentGrade);
  //         expect(restaurant.address.building).to.equal(newRestaurant.address.building);
  //         expect(restaurant.address.street).to.equal(newRestaurant.address.street);
  //         expect(restaurant.address.zipcode).to.equal(newRestaurant.address.zipcode);
  //       });
  //   });
  // });

  // describe('PUT endpoint', function() {

  //   // strategy:
  //   //  1. Get an existing restaurant from db
  //   //  2. Make a PUT request to update that restaurant
  //   //  3. Prove restaurant returned by request contains data we sent
  //   //  4. Prove restaurant in db is correctly updated
  //   it('should update fields you send over', function() {
  //     const updateData = {
  //       name: 'fofofofofofofof',
  //       cuisine: 'futuristic fusion'
  //     };

  //     return Restaurant
  //       .findOne()
  //       .then(function(restaurant) {
  //         updateData.id = restaurant.id;

  //         // make request then inspect it to make sure it reflects
  //         // data we sent
  //         return chai.request(app)
  //           .put(`/restaurants/${restaurant.id}`)
  //           .send(updateData);
  //       })
  //       .then(function(res) {
  //         expect(res).to.have.status(204);

  //         return Restaurant.findById(updateData.id);
  //       })
  //       .then(function(restaurant) {
  //         expect(restaurant.name).to.equal(updateData.name);
  //         expect(restaurant.cuisine).to.equal(updateData.cuisine);
  //       });
  //   });
  // });

  // describe('DELETE endpoint', function() {
  //   // strategy:
  //   //  1. get a restaurant
  //   //  2. make a DELETE request for that restaurant's id
  //   //  3. assert that response has right status code
  //   //  4. prove that restaurant with the id doesn't exist in db anymore
  //   it('delete a restaurant by id', function() {

  //     let restaurant;

  //     return Restaurant
  //       .findOne()
  //       .then(function(_restaurant) {
  //         restaurant = _restaurant;
  //         return chai.request(app).delete(`/restaurants/${restaurant.id}`);
  //       })
  //       .then(function(res) {
  //         expect(res).to.have.status(204);
  //         return Restaurant.findById(restaurant.id);
  //       })
  //       .then(function(_restaurant) {
  //         expect(_restaurant).to.be.null;
  //       });
    // });
  });
});
