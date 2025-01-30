import { Hono } from 'hono'
import {PrismaClient} from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {sign, verify} from 'hono/jwt'

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

// implementing a middleware to verify the user before letting him proceed 

// any user hitting route /api/v1/blog OR /api/v1/blog/-- will have to be verified first before proceeding

app.use('/api/v1/blog/*', async (c , next)=>{
  const header = c.req.header("Authorization") || ""
  const headerToken = header.split(" ")[1] // splitting the "bearer bekek" => ["bearer", "<token>"]
  try{
    const response  = await verify(headerToken , c.env.JWT_SECRET)
    if(response.id){
//  we tackled some issues => first we declare the type Variables with userId : string to use 'userId' in the c.set()

//  then => we wrapped response.id in String so that we succesfully pass 'userId' into the jwt payload 
      c.set('userId', String(response.id))
      await next()
    }
    else{
      c.status(403)
      return c.json({msg :"caught at middleware. User not authenticated"})
    }
  }
  catch(e){
    c.status(403)
    return c.json({msg :"some error occured"})
  }
})

app.get('/', (c) => {
  return c.text('Hello Hono! Did u get here?')
})

app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json()
  try{
    const user = await prisma.user.create({
      data:{
        email : body.email,
        password : body.password
      }
    })

    const token =await sign({id : user.id},c.env.JWT_SECRET)
    return c.json({
      jwt : token
    })
  }catch(e){
    return c.status(403)
  }
})

app.post('/api/v1/signin', async (c)=>{

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  // get the body, and find the user if it exsits
  const body = await c.req.json()
  const user = await prisma.user.findUnique({
    where:{
      email : body.email
    }
  })

  if(!user){
    c.status(403)
    return c.json({msg : "user doesn't exist"})
  }
  // if the user exists then return a token 
  const token = await sign({id : user.id}, c.env.JWT_SECRET)
  return c.json({jwt : token})
})

app.post('/api/v1/blog', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  // @ts-ignore
  const userId  = c.get('userId') as string
  
  const user = await prisma.user.findUnique({
    where:{
      id : userId,
    }
  })



  return c.json({"user" : user})
  // return c.text("hello hono ") 
  
})

app.put('/api/v1/blog', (c)=>{
  
  return c.text("hello hono ") 
})

app.get('/api/v1/blog/:id', (c)=>{
  return c.text("hello hono ") 
})

export default app
