const userModel = require("../Models/user");

exports.register = async (req, res) => {
  try {
    const { name, email, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let userExist = await userModel.findOne({ email: email });

    if (!userExist) {
      let newUser = new userModel({ name, email, photoUrl: photoUrl || "" });
      await newUser.save();
      return res.status(200).json({
        message: "user Registered successfully",
        user: newUser,
      });
    }

    return res.status(200).json({
      message: "Welcome Back",
      user: userExist,
    });
  } catch (err) {
    console.log("Error in user registration:", err);
    res.status(500).json({ error: "server error", message: err.message });
  }
};
