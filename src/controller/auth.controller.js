import userModel from "../model/auth.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
export const  registerUser = async function (req,res) {
    try {
        const {username,email,password}= req.body;
        const isuserexist = await userModel.findOne({
            $or: [ { email },{ username }]
        })
        if (isuserexist) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await userModel.create({
            username,
            email,
            password :hashedPassword
        })

        const token = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:'1d'});
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const githubAuthCallback = async function (req,res) {
    try {
        const userFromProvider = req.user;
        if (!userFromProvider) return res.status(400).json({ message: 'No GitHub user data received' });

        const id = userFromProvider.id;
        const emailObj = userFromProvider.emails && userFromProvider.emails[0];
        const emailVal = emailObj ? (emailObj.value || null) : null;
        const username = (emailVal ? emailVal.split('@')[0] : 'githubuser') + Math.floor(Math.random() * 10000);

        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { githubId: id }, { email: emailVal } ]
        });

        if (isUserAlreadyExists) {
            const token = jwt.sign({ id: isUserAlreadyExists._id }, config.JWT_SECRET, { expiresIn: "2d" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 2 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                message: "Github authentication successful", user: {
                    id: isUserAlreadyExists._id,
                    email: isUserAlreadyExists.email,
                }
            })
        }

        const user = await userModel.create({
            username,
            email: emailVal,
            githubId: id,
        })

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "2d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User registered successfully via GitHub",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}