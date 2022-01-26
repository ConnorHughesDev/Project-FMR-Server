const router = require('express').Router();
const { models } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize/lib/errors');
const validateJWT = require('../middleware/validate-session')

router.post('/signup', async (req, res) => {
    console.log(req.body.user)
    const { username, password, isAdmin, email } = req.body.user;
    try {
        await models.UsersModel.create({
            email: email,
            username: username,
            password: bcrypt.hashSync(password, 10),
            isAdmin: isAdmin
        })
            .then(
                user => {
                    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                        expiresIn: 60 * 60 * 24
                    });
                    res.status(201).json({
                        user: user,
                        message: 'user created',
                        sessionToken: `Bearer ${token}`
                    });
                }
            )
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: 'Username already in use'
            });
        } else {
            res.status(500).json({
                error: `Failed to register user: ${err}`
            });
        };
    };
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body.user;
    try {
        await models.UsersModel.findOne({
            where: {
                username: username,
            }
        })

            .then(
                user => {
                    if (user) {
                        bcrypt.compare(password, user.password, (err, matches) => {
                            if (matches) {
                                let token = jwt.sign({
                                    id: user.id,
                                    isAdmin: user.isAdmin,
                                    username: user.username
                                }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })
                                res.json({
                                    user: user,
                                    message: 'logged in',
                                    sessionToken: `Bearer ${token}`
                                })
                            } else {
                                res.status(502).send({
                                    error: 'bad gateway'
                                })
                            }
                        })
                    } else {
                        res.status(500).send({
                            error: 'failed to authenticate'
                        })
                    }
                }
            )
    } catch (err) {
        res.status(501).send({
            error: 'server does not support this functionality'
        })
    }
})

router.get('/userinfo', validateJWT, async (req, res) => {
    const isAdmin = req.user.isAdmin

    if (isAdmin == true) {
        try {
            await models.UsersModel.findAll({
                include: [
                    {
                        model: models.PostsModel,
                        include: [
                            {
                                model: models.CommentsModel
                            }
                        ]
                    }
                ]
            })
                .then(
                    users => {
                        res.status(200).json({
                            users: users
                        });
                    }
                )
        } catch (err) {
            res.status(500).json({
                error: `Failed to retrieve users: ${err}`
            });
        };
    } 
});

//! DELETE a user
router.delete("/:id", validateJWT, async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (isAdmin == true) {
        try {
            await models.UsersModel.destroy({
                where: {
                    id: req.params.id,
                }
            }).then((result) => {
                if (result) {
                    res.status(200).json({
                        message: "User successfully deleted",
                        deletedUser: result
                    })
                } else {
                    res.status(400).json({
                        message: 'Not today!'
                    })
                }
            })
        } catch (err) {
            res.status(500).json({
                message: `Failed to delete User: ${err}`
            })
        }
    } 
})

module.exports = router;
