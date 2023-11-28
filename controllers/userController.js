const asyncHandler = require ('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

//@desc Register a user 
//@route GET /api/users/register
//@ access public

const registerUser = asyncHandler(async(req, res,) => {
    if(!req.body.username || !req.body.email || !req.body.password){
        res.status(400);
        throw new Error('All fields are mandatory')
    }
        const userAvailable = await User.findOne({ email: req.body.email });
    if (userAvailable){
        res.status(400);
        throw new Error('User already registered!');
    }
    //Hash Password
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log(" Hashed Password " + hashedPassword);
    //creating a new user
    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    })
    console.log(`User Created ${newUser}`);
    if (newUser) {
        res.status(201).json({ _id: newUser.id, email: newUser.email })
    } else {
        res.status(400);
        throw new Error('User data is not Valid')
    }
    res.json({message: "Register the user"});
})

//@desc Login a user 
//@route GET /api/users/login
//@ access public

const loginUser = asyncHandler(async(req, res) => {
    const { email, password} = req.body
    if(!email || !password){
        res.status(400);
        throw new Error('All fields are required!')
    }
    //use this to confirm if the user is in the db
    const user = await User.findOne({ email });
    //compare password with the one we have in our db
    if(user && (await bcrypt.compare(password, user.password))){
        //provide access token
        const accessToken = jwt.sign({
            user: {
                user: user.username,
                email: user.email,
                id: user.id, 
            },
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30d'}
        ); 
        res.status(200).json({ accessToken });
    }else{
        res.status(401)
        throw new Error ('email or password is not valid')
    }
})

//@desc Current User Info 
//@route GET /api/users/current
//@ access private

const currentUser = asyncHandler(async(req, res) => {
    res.json(req.user);
})

module.exports = { registerUser, loginUser, currentUser }