import { Hono } from 'hono'
import {PrismaClient} from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {sign, verify} from 'hono/jwt'
import { userRouter } from './routes/userRouter'
import { blogRouter } from './routes/blogRouter'


// type Variable = {
//   userId: string  undefined
// }

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



// app.use("/api/v1/blog/*", async (c, next)=>{
//   const headerAuth  = c.req.header('Authorization') || ""
//   const token = headerAuth.split(" ")[1] // => ["Bearer", "<token>"]
//   try{
//     const res = await verify(token, c.env.JWT_SECRET);
//     if(!res.id){
//       c.status(403)
//       return c.json({
//         msg : "Invalid credentials. User doesn't exist"
//       })
//     }
//     //  we tackled some issues => first we declare the type Variables with userId : string to use 'userId' in the c.set()
    
//     //  then => we wrapped response.id in String so that we succesfully pass 'userId' into the jwt payload 
//     c.set('userId', String(res.id))
//     await next()
//   }
//   catch(e){
//     c.status(411);
//     return c.json({
//       msg : "some error occured while fetching the user credential(s)"
//     })
//   }
// })

// any user hitting route /api/v1/blog OR /api/v1/blog/-- will have to be verified first before proceeding

// app.use('/api/v1/blog/*', async (c , next)=>{
//   const header = c.req.header("Authorization") || ""
//   const headerToken = header.split(" ")[1] // splitting the "bearer bekek" => ["bearer", "<token>"]
//   try{
//     const response  = await verify(headerToken , c.env.JWT_SECRET)
//     if(response.id){
//       c.set('userId', String(response.id))
//       await next()
//     }
//     else{
//       c.status(403)
//       return c.json({msg :"caught at middleware. User not authenticated"})
//     }
//   }
//   catch(e){
//     c.status(403)
//     return c.json({msg :"some error occured"})
//   }
// })

app.get('/', (c) => {
  return c.text('Hello Hono! Did u get here?')
})

export default app

