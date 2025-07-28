import { JWT_CLAIMS } from '../constants/auth.js';
import { decodeJwt } from 'jose';

export const parseJWT = (token) => {
  if (!token) return null;
  
  try {
    const parsed = decodeJwt(token);

    return {
      id: parsed[JWT_CLAIMS.ID],
      username: parsed[JWT_CLAIMS.USERNAME],
      email: parsed[JWT_CLAIMS.EMAIL],
      role: parsed[JWT_CLAIMS.ROLE],
      is_muted: parsed.IsMuted === 'True',
      exp: parsed.exp,
      aud: parsed.aud,
      email_confirmed: parsed.EmailConfirmed === 'True'
    };
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const tokenData = parseJWT(token);
  if (!tokenData?.exp) return true;
  return Date.now() >= tokenData.exp * 1000;
};