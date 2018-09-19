"use strict";

const mongoose = require("mongoose");

const blogsSchema = mongoose.Schema({
	
	title: { type: String, required: true },
  	content: { type: String, required: true },
  	author: { 
  		firstName: { type: String, required: true },
  		lastName: { type: String, required: true },
  	}
});

blogsSchema.virtual('fullName').get(function() {
 	return `${this.author.firstName} ${this.author.lastName}`
});

blogsSchema.methods.serialize = function ()  {
	return {
		id: this._id,
		author: this.fullName,
		content: this.content,
		title: this.title,
	};
};

const Blogs = mongoose.model('Blogs', blogsSchema);

module.exports = {Blogs};