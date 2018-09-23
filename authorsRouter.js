const express = require("express");

const router = express.Router();

const { Authors } = require("./models")

const { Blogs } = require("./models")

router.post("/", (req, res) => {
  const requiredFields = ["firstName", "lastName", "userName"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Authors.find()
  .then(authors => {
  	console.log(authors);
  	authors.forEach(author => {
  		if (author.userName === req.body.userName) {
  			return res.status(400).send("userName already exists");
  		}
  	})
    
  })
  .catch(err=> {
    console.error(err)
    res.status(500).json({message: "Internal server error"})
  });
  

  Authors.create({
   firstName: req.body.firstName,
   lastName: req.body.lastName,
   userName: req.body.userName,
  })
    .then(author => res.status(201).json(author))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.put("/:id", (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  Authors.find()
  .then(authors => {
  	console.log(authors);
  	authors.forEach(author => {
  		if (author.userName === req.body.userName) {
  			return res.status(400).send("userName already exists");
  		}
  	})  
  })

  const toUpdate = {};
  const updateableFields = ["firstName", "lastName", "userName"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Authors
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(author => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});



router.delete("/:id", (req, res) => {
  Blogs.deleteMany({author: req.params.id}, (err)=>console.error(err));
  Authors.findByIdAndRemove(req.params.id)
    .then(author => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" })
  );
});






module.exports = router;