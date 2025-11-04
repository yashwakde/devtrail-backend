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

export const loginUser = async function (req,res) {
    const {email,password} = req.body;
     const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // token bana 
    const token = jwt.sign({id:user._id},config.JWT_SECRET)
     
    res.cookie("token",token);
    res.status(200).json({
        message:"Login successful",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
        }
    })

}

export const githubAuthCallback = async function (req,res) {
    console.log("GitHub user info:", req.user);
  const {id, username,emails}= req.user;
  const email = emails?.[0]?.value || `${username}@github.com`;
  const finalusername = username+Math.floor(Math.random()*1000);
   const isUserAlreadyExists = await userModel.findOne({
      $or: [{ githubId: id }, { email }],
    });
     if (isUserAlreadyExists) {
      // JWT token generate karo
      const token = jwt.sign(
        { id: isUserAlreadyExists._id },
        config.JWT_SECRET,
        { expiresIn: "2d" }
      );

      res.cookie("token", token);
      return res.status(200).json({
        message: "GitHub authentication successful",
        user: {
          id: isUserAlreadyExists._id,
          username: isUserAlreadyExists.username,
          email: isUserAlreadyExists.email,
        },
      });
    }
     const user = await userModel.create({
      username: finalusername,
      email,
      githubId: id,
    });
      const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "2d" }
    );
  res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully via GitHub",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

}


export const logoutUser = function (req, res) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}