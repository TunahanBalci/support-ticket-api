import bcrypt from "bcryptjs";
import express from "express";
import { addRefreshToken, deleteRefreshTokenById, findRefreshToken, revokeTokens } from "../controllers/auth.controller";
import { createUserByEmailAndPassword, findUserByEmail, findUserById } from "../controllers/user.controller";
import { generateTokens } from "../utils/jwt.utils";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("No email AND/OR password provided");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use.");
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const { accessToken, refreshToken } = await generateTokens(user);
    await addRefreshToken(refreshToken, user.id as string);

    res.status(201).json({
      accessToken,
      refreshToken,
    });
  }
  catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("No email AND/OR password provided");
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const { accessToken, refreshToken } = await generateTokens(existingUser);
    await addRefreshToken(refreshToken, existingUser.id as string);

    res.json({
      accessToken,
      refreshToken,
    });
  }
  catch (err) {
    next(err);
  }
});

export default router;
