"use strict";

const mongoose = require("mongoose");

const authorsSchema = mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	userName: {type: String, required: true},
})

const commentSchema = mongoose.Schema({content: {type: String}})

const blogsSchema = mongoose.Schema({
	
	title: { type: String, required: true },
  	content: { type: String, required: true },
  	author: { type: mongoose.Schema.Types.ObjectId, ref: 'Authors' },
  	comments: [commentSchema]
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

blogsSchema.methods.serialize2 = function ()  {
	console.log(this.comments[0].content)
	return {
		id: this._id,
		author: this.fullName,
		content: this.content,
		title: this.title,
		comments: {content: this.comments[0].content},
	};
};


blogsSchema.pre('find', function(next) {
	this.populate('author');
	console.log('pre-hook find');
	next();
});

blogsSchema.pre('findById', function(next) {
	this.populate('author');
	console.log('pre-hook findById');
	next();
});

const Blogs = mongoose.model('Blogs', blogsSchema);

const Authors = mongoose.model('Authors', authorsSchema);

const Comments = mongoose.model('Comments', commentSchema)

module.exports = {Blogs, Authors, Comments};