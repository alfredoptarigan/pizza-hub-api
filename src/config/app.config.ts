import { registerAs } from "@nestjs/config"

export default registerAs('app', () => ({
    port: Number(process.env.APP_PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
}));