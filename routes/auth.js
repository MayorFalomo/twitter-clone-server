const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");

//REGISTER - AUTHENTICATION TO HIDE PASSWORD FOR USERS
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    //Since we imported User from our User schema component here is where we expect our information to be created for new user hence for example username: request.body(A method).username and so forth
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
      usersAt: req.body.usersAt,
    });
    //Here we assign the newly created user to the user variable and save() which is a mongoose method), Then we say the res.user should come in json file
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  //Checking for correct username
  let existingUser;

  try {
    existingUser = await User.findOne({ username: req.body.username });
  } catch (error) {
    console.log(error);
  }

  if (!existingUser) {
    return res.status(404).json({ message: "Incorrect Credentials!" });
  }

  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(400).json("Wrong Username!");
    //Checking for correct password
    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) {
      return res.status(400).json("Wrong Password!");
    }

    //password would be hidden, others can be anything but the spread operator is important
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
