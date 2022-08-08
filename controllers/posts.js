const { model } = require('mongoose');
const Post = require('../models/post');
const { catchAsync } = require('../utilities/catchAsync');

function PostNotFound(req, res) {
    req.flash('error', 'Пост не найден');
    res.redirect('/posts');
}

module.exports.index = catchAsync(async (req, res, next) => {
    const posts = await Post.find({}).limit(30);
    res.render('post/index', { posts, title: 'Все посты' });
});

module.exports.renderNewForm = (req, res, next) => {
    res.render('post/new', { title: 'Создать новый пост' });
};

module.exports.createNewPost = catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    res.redirect(`/posts/${post._id}`);
});

module.exports.show = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!post) PostNotFound(req, res);
    res.render('post/show', { post, title: post.title });
});

module.exports.renderEditForm = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
        PostNotFound(req, res);
    } else {
        res.render('post/edit', { post, title: `Редактировать - ${post.title}` });
    }
});

module.exports.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body.post);
    if (!post) PostNotFound(req, res);
    req.flash('success', 'Пост успешно редактирован');
    res.redirect(`/posts/${post._id}`);
});

module.exports.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) PostNotFound(req, res);
    req.flash('success', 'Пост успешно удален');
    res.redirect('/posts');
});