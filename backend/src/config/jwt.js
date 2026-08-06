import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'academiapro_secret_key_union_jaguera_fc_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
