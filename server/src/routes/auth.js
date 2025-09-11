import express from "express";
import fetch from "node-fetch";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import "dotenv/config";

import {
  signAccess,
  signRefresh,
  setAuthCookies,
  setStateCookie,
  SERVER_URL,
  CLIENT_URL,
} from "../utils/auth.js";
import { prisma } from "../lib/prisma.js";
import { ensureAuth } from "../middleware/ensureAuth.js";

const router = express.Router();

// -------- Protected route
router.get("/me", ensureAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub }, // 👈 spójnie używamy sub
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// -------- Refresh token
router.post("/refresh", async (req, res) => {
  const token = req.cookies["refresh_token"];
  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // pobierz usera, żeby znać rolę
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isBlocked: true },
    });

    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isBlocked) {
      return res.status(403).json({ error: "Account blocked" });
    }

    const newAccess = signAccess({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefresh = signRefresh({ sub: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: newRefresh, isValid: true },
    });

    setAuthCookies(res, newAccess, newRefresh);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// -------- Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies["refresh_token"];
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isValid: false },
      });
    }
  } catch (e) {
    console.error("Logout error:", e);
  }
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(204).end();
});

// -------- Google OAuth endpoints
router.get("/google", (req, res) => {
  const state = nanoid();
  setStateCookie(res, state);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const stateCookie = req.cookies["oauth_state"];
    if (!state || !stateCookie || state !== stateCookie) {
      return res.status(400).send("Invalid state");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SERVER_URL}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error(tokenJson);
      return res.status(400).send("Token exchange failed");
    }

    const userinfoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      }
    );
    const profile = await userinfoRes.json();

    const user = await prisma.user.upsert({
      where: { googleId: profile.sub },
      update: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      },
      create: {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      },
    });
    if (user.isBlocked) {
      // Zwracamy JSON z błędem zamiast redirectu
      return res.redirect(`${CLIENT_URL}/blocked?reason=account-blocked`);
    }

    // tworzymy access i refresh na bazie user.id → w payload sub
    const accessToken = signAccess({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefresh({ sub: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, isValid: true },
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.clearCookie("oauth_state");
    res.redirect(CLIENT_URL);
  } catch (e) {
    console.error(e);
    console.log(e);
    res.status(500).send("OAuth error");
  }
});

// -------- Export router
export default router;
