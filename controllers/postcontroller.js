const router = require('express').Router();
const { models } = require('../models');
const validateJWT = require('../middleware/validate-session')

// // * image upload ----------------------
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
// const fs = require('fs')
// const util = require('util')
// const unlinkFile = util.promisify(fs.unlink)

// const { uploadFile, getFileStream } = require('./s3')
// //* ------------------------------------------

// //* image upload -----------------------
// app.get('/images/:key', (req, res) => {
//     const key = req.params.key
//     const readStream = getFileStream(key)

//     readStream.pipe(res)
// })

// app.post('/images', upload.single('image'), async (req, res) => {
//     const file = req.file
//     console.log(file)
//     const result = await uploadFile(file)
//     await unlinkFile(file.path)
//     console.log(result)
//     const description = req.body.description
//     res.send({ imagePath: `/images/${result.Key}` })
// })
// //* ---------------------------------------

//! POST create a post
router.post('/post', validateJWT, async (req, res) => {
    const { title, make, model, year, content } = req.body.post;
    try {
        await models.PostsModel.create({
            title: title,
            content: content,
            make: make,
            model: model,
            year: year,
            userId: req.user.id,
            username: req.user.username
        })
            .then(
                post => {
                    res.status(201).json({
                        post: post,
                        message: 'post created'
                    });
                }
            )
    } catch (err) {
        res.status(500).json({
            error: `Failed to create post: ${err}`
        });
    };
});

//! PUT updating a Post entry
router.put("/:id", validateJWT, async (req, res) => {
    const { title, make, model, year, content } = req.body.post;
    const postId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin

    const query = {
        where: {
            id: postId,
            userId
        }
    };

    const adminQuery = {
        where: {
            id: postId
        }
    }

    const updatedPost = {
        title,
        make,
        model,
        year,
        content
    };

    // try {
    //     const update = await models.PostsModel.update(updatedPost, query)
    //     .then((result) => {
    //         if (result) {
    //             res.status(200).json({
    //                 message: "Post successfully updated",
    //                 update
    //             })
    //         } else {
    //             res.status(400).json({
    //                 message: 'Not your post'
    //             })
    //         }
    //     })
    // } catch (err) {
    //     res.status(500).json({
    //         message: `Failed to update post: ${err}`
    //     })
    // }
    if (isAdmin == true) {
        try {
            const update = await models.PostsModel.update(updatedPost, adminQuery)
            res.status(200).json({
                // message: "Post updated",
                update
            })
        } catch (err) {
            res.status(500).json({
                message: "Failed to update Post",
                error: `${err}`
            })
        }
    } else {
        try {
            const update = await models.PostsModel.update(updatedPost, query)
            res.status(200).json({
                // message: "Post updated",
                update
            })
        } catch (err) {
            res.status(500).json({
                message: "Failed to update Post",
                error: `${err}`
            })
        }
    }
});

//! GET all posts
router.get('/', async (req, res) => {

        try {
            const posts = await models.PostsModel.findAll();
            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json({ message: `Failed to get post. Error: ${err}` })
        }   
});

//! DELETE a post
router.delete("/:id", validateJWT, async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (isAdmin == true) {
        try {
            await models.PostsModel.destroy({
                where: {
                    id: req.params.id,
                }
            }).then((result) => {
                if (result) {
                    res.status(200).json({
                        message: "Post successfully deleted",
                        deletedPost: result
                    })
                } else {
                    res.status(400).json({
                        message: 'Not your post'
                    })
                }
            })
        } catch (err) {
            res.status(500).json({
                message: `Failed to delete post: ${err}`
            })
        }
    } else {
        try {
            await models.PostsModel.destroy({
                where: {
                    id: req.params.id,
                    userId
                }
            }).then((result) => {
                if (result) {
                    res.status(200).json({
                        message: "Post successfully deleted",
                        deletedPost: result
                    })
                } else {
                    res.status(400).json({
                        message: 'Not your post'
                    })
                }
            })
        } catch (err) {
            res.status(500).json({
                message: `Failed to delete post: ${err}`
            })
        }
    }
})

module.exports = router;