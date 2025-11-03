import mongoose from "mongoose";
const authSchema = new mongoose.Schema({
  username: {
        type: String,
        required: [ true, "Username is required" ],
        unique: [ true, "Username must be unique" ],
        minlength: [ 3, "Username must be at least 3 characters long" ],
        maxlength: [ 30, "Username must be at most 30 characters long" ]
    },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email must be unique"],
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },

   githubId: {
        type: String,
        unique: true,
    },

     password: {
        type: String,
        required: function () {
            return !this.githubId;
        }
    },

   
});

 const userModel  = mongoose.model("user",authSchema);


 export default userModel;