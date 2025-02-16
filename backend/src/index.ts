import { Hono } from 'hono'
import {PrismaClient} from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {sign, verify} from 'hono/jwt'
import { userRouter } from './routes/userRouter'
import { blogRouter } from './routes/blogRouter'


const app = new Hono<{ // initialize this to let the context get the environment varibles (and all that would be in the wrangler.toml file)
  Bindings:{ // now this would not ts error for c.env 
    DATABASE_URL : string
    JWT_SECRET : string
  },
  Variables : {
    userId : string 
  }
}>()

// Grouping of the routes
app.route("/api/v1/user", userRouter)
app.route("/api/v1/blog", blogRouter)




app.get('/', (c) => {
  return c.text('Hello Hono! Did u get here?')
})

export default app

