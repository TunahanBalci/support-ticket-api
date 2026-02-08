import bcrypt from "bcryptjs";
import express from "express";
import { addRefreshToken } from "../controllers/auth.controller";
import { createUserByEmailAndPassword, findUserByEmail } from "../controllers/user.controller";
import { validateEmail, validatePassword } from "../middlewares/validate.middlewares";
import { generateTokens } from "../utils/jwt.utils";

const router = express.Router();

/**
 * REGISTRATION 
 * POST /api/auth/register
 * 
 * request body: { email: string, password: string }
 *
 * Creates a new user with the provided email and password.
 * Returns access and refresh tokens upon successful registration.
 */
router.post("/register", validateEmail, validatePassword, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      return next(new Error("Email already in use"));
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const { accessToken, refreshToken } = await generateTokens(user);
    await addRefreshToken(refreshToken, user.id as string);

    res.status(201).json({
      data: {
        accessToken,
        refreshToken,
      },
      message: "User registered successfully",
    });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});


/**
 * LOGIN  
 * POST /api/auth/login
 * 
 * request body: { email: string, password: string }
 *
 * Authenticates a user with the provided email and password.
 * Returns access and refresh tokens upon successful login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      return next(new Error("No email AND/OR password provided"));
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      return next(new Error("Invalid login credentials"));
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      return next(new Error("Invalid login credentials"));
    }

    const { accessToken, refreshToken } = await generateTokens(existingUser);
    await addRefreshToken(refreshToken, existingUser.id as string);

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
      },
      message: "Login successful",
    });
  }
  catch (err) {
    res.status(500);
    next(err);
  }
});

export default router;
