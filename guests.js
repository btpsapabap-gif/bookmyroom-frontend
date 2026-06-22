const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

/* Register Guest */

router.post("/register", async (req, res) => {

  try {

    const {
      guest_name,
      mobile,
      email
    } = req.body;

    const { data, error } =
      await supabase
        .from("guests")
        .insert([{
          guest_name,
          mobile,
          email
        }])
        .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      guest: data[0]
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

/* Login Guest */

router.post("/login", async (req, res) => {

  const { mobile } = req.body;

  const { data } =
    await supabase
      .from("guests")
      .select("*")
      .eq("mobile", mobile)
      .single();

  if (!data) {

    return res.status(401).json({
      success: false,
      message: "Guest not found"
    });

  }

  res.json({
    success: true,
    guest: data
  });

});

module.exports = router;