const router = require('express').Router();
const { models } = require('../models');
const validateJWT = require('../middleware/validate-session')

//! POST make a comment
router.post('/comment', validateJWT, async (req, res) => {
    const { content, postId } = req.body.comment;
    try {
        await models.CommentsModel.create({
            content: content,
            postId: postId,
            userId: req.user.id,
            username: req.user.username
        })
            .then(
                comment => {
                    res.status(201).json({
                        comment: comment,
                        message: 'comment created'
                    });
                }
            )
    } catch (err) {
        res.status(500).json({
            error: `Failed to create comment: ${err}`
        });
    };
});

//! PUT updating a Comment entry
router.put("/:id", validateJWT, async (req, res) => {
    const { content } = req.body.comment;
    const commentId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin

    const query = {
        where: {
            id: commentId,
            userId
        }
    };

    const adminQuery = {
        where: {
            id: commentId
        }
    }

    const updatedComment = {
        content
    };

    if (isAdmin == true) {
        try {
            const update = await models.CommentsModel.update(updatedComment, adminQuery);
            res.status(200).json({
                message: "Comment updated",
                update
            })
        } catch (err) {
            res.status(500).json({
                message: "Failed to update Comment",
                error: `${err}`
            })
        }
    } else {
        try {
            const update = await models.CommentsModel.update(updatedComment, query);
            res.status(200).json({
                message: "Comment updated",
                update
            })
        } catch (err) {
            res.status(500).json({
                message: "Failed to update Comment",
                error: `${err}`
            })
        }
    }
});

//! GET all Comments
router.get('/', async (req, res) => {
    try {
        const comments = await models.CommentsModel.findAll();
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: `Failed to get comments. Error: ${err}` })
    }
});

//! DELETE a Comment
router.delete("/:id", validateJWT, async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (isAdmin == true){
    try {
        await models.CommentsModel.destroy({
            where: {
                id: req.params.id,
            }
        }).then((result) => {
            if (result) {
                res.status(200).json({
                    message: "Comment successfully deleted",
                    deletedComment: result
                })
            } else {
                res.status(400).json({
                    message: 'Not your Comment'
                })
            }
        })
    } catch (err) {
        res.status(500).json({
            message: `Failed to delete comment: ${err}`
        })
    }} else {
        try {
            await models.CommentsModel.destroy({
                where: {
                    id: req.params.id,
                    userId
                }
            }).then((result) => {
                if (result) {
                    res.status(200).json({
                        message: "Comment successfully deleted",
                        deletedComment: result
                    })
                } else {
                    res.status(400).json({
                        message: 'Not your Comment'
                    })
                }
            })
        } catch (err) {
            res.status(500).json({
                message: `Failed to delete comment: ${err}`
            })
        }
    }
})

module.exports = router;