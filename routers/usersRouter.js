const fs = require("fs");

const express = require("express");
const router = express.Router();
const {
    v4: uuidv4
} = require("uuid");


var jwt = require('jsonwebtoken');

const {
    auth
} = require('../middlewares/auth')
const User = require('../models/User')
require('../mongoConnect')

router.post("/", async (req, res, next) => {
    try {
        const {
            username,
            age,
            password
        } = req.body;
        const id = uuidv4();

        const users = new User({
            username,
            age,
            password,
            id
        })
        await users.save()
        res.status(200).send({
            message: "sucess"
        });
    } catch (error) {
        next({
            status: 422,
            message: "name and password required"
        });
    }
});

router.patch("users/:userId", auth, async (req, res, next) => {
    if (req.user.id !== req.params.userId) next({
        status: 403,
        message: "Authorization error"
    })
    try {
        const regdb = User.updateMany({
            _id: req.user.id
        }, {
            $set: {
                password,
                age
            }
        })


        res.send("sucess")
    } catch (error) {
        next({
            status: 500,
            internalMessage: error.message
        });
    }

});

router.post("/users/login", async (req, res, next) => {
    try {
        const {
            username,
            password,

        } = req.body
        const user = await User.findOne({
            username
        })
        if (!user) return next({
            status: 401,
            message: "username or passord is incorrect"
        })

        if (user.password !== password) next({
            status: 401,
            message: " passord is incorrect"
        })

        const payload = {
            id: user.id,
            username: user.username
        }
        const token = jwt.sign(payload, serverConfig.secret, {
            expiresIn: "1h"
        })

        return res.status(200).send({
            message: "Logged in Successfully",
            token
        })
    } catch (error) {
        next({
            status: 500,
            internalMessage: error.message
        });
    }
})






router.get('/', auth, async (req, res, next) => {
    try {

        const query = req.query.id ? {} : {
            id: req.query.id
        }
        const users = await User.find(query)
        res.send(users)
    } catch (error) {
        next({
            status: 500,
            internalMessage: error.message
        });
    }

})

router.get('/', auth, async (req, res, next) => {
    try {

        const query = req.query.id ? {} : {
            id: req.query.id
        }
        await User.deleteOne(query)
        res.send("user deleted")
    } catch (error) {
        next({
            status: 500,
            internalMessage: error.message
        });
    }

})


module.exports = router;
