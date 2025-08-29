import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from './configTokens.js'

export const isProd = process.env.NODE_ENV === 'production';
export const CLIENT_URL = process.env.CLIENT_URL;
export const SERVER_URL = process.env.SERVER_URL;

// JWT helpers
export function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES / 1000 });
}

export function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES / 1000 });
}

// Cookie helpers
export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: ACCESS_TOKEN_EXPIRES,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: REFRESH_TOKEN_EXPIRES,
  });
}

// Cookie helper dla OAuth state
export function setStateCookie(res, state) {
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 10, // 10 minut
  });
}
