const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET="Mayankisagoodb$oy"

// Create a new user using: POST "/api/auth/createuser". Doesn't require Auth
router.post(
    "/createuser",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid name").isEmail(),
        body("password", "Password should be atleast 5 characters").isLength({ min: 5 }),
    ],
    async (req, res) => {
        // If there are errors, return Bad request and the errors
        let success;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let success = false;
            return res.status(400).json({success, errors: errors.array() });
        }

        try {
            // Check whether the user with this email exists already
            let user = await User.findOne({ email: req.body.email });

            const salt=await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(req.body.password,salt)
            if (user) {
                return res.status(400).json({ success, error: "User with this email already exists", })
            }
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPassword,
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data,JWT_SECRET);
            success = true;
            res.json({success,authToken});    
        } catch (error) {
            console.error(error.message);
            res.status(500).send({success, error:"Internal Server Error"});            
        }
    }
); 


// Authenticate a user using: POST "/api/auth/login". Dont require Auth
router.post(
    "/login",
    [
        body("email", "Enter a valid name").isEmail(),
        body("password", "Password cannot be blanked").exists(),
    ],
    async (req, res) => {
        // If there are errors, return Bad request and the errors
        let success=false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success=false;
            return res.status(400).json({ errors: errors.array() });
        }

        const {email,password}=req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({error:"Please try to login with correct credentials"});
            }

            const passwordCompare=await bcrypt.compare(password,user.password);
            if(!passwordCompare){
                return res.status(400).json({success,error:"Please try to login with correct credentials"});
            }

            const data = {
                user: {
                    id: user.id,
                },
            };
            success=true;
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({success,authToken});    

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");  
        }
    }
);


// Get logged in user details using: POST "/api/auth/getuser". Require Auth
router.post("/getuser",fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");  
    }
});
    



module.exports = router;