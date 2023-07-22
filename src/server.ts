import fastify from 'fastify'
import { env } from './env';

const app = fastify();

app.get('/hello', () => {
    return "Hello world"
})

app.listen({
    port: env.PORT
}).then(() => {
    console.log('HTTP SERVER RUNNING')
})