import mongoose from "mongoose";



const userSchema = new mongoose.Schema(

{

name: {

type: String,

required: [true, "User name is required"],

trim: true,

},

email: {

type: String,

required: [true, "Email is required"],

unique: true,

lowercase: true,

trim: true,

},

age: {

type: Number,

required: [true, "Age is required"],

min: [0, "Age cannot be negative"],

},

password: {

type: String,

required: [true, "Password is required"],

minlength: [6, "Password must be at least 6 characters long"],

select: false, 

},

address: {

street: { type: String, trim: true },

city: { type: String, trim: true },

country: { type: String, trim: true },

},

role: {

type: String,

enum: ["user", "admin"],

default: "user",

},

isActive: {

type: Boolean,

default: true,

},

hobbies: [

{

type: String,

trim: true,

},

],

},

{

timestamps: true, 

}

);


userSchema.pre("save", async function (next) {

try {

if (!this.isModified("password")) return next();

const salt = await bcrypt.genSalt(10);

this.password = await bcrypt.hash(this.password, salt);

next();

} catch (err) {

next(err);

}

});


userSchema.methods.comparePassword = async function (enteredPassword) {

return bcrypt.compare(enteredPassword, this.password);

};


const User = mongoose.model("User", userSchema);

export default User;