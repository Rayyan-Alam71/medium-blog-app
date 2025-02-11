import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import {sign , verify, decode} from 'hono/jwt'
import z from "zod"
import {signinInput} from "medium-common-rayyan"
export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables:{
      userId : string
    }
}>()
// implementing a middleware to verify the user before letting him proceed 

// userRouter.use("/*", async (c, next) => {
//   const token = c.req.header("Authorization")?.split(" ")[1] || ""

//   try{
//     const res = await verify(token , c.env.JWT_SECRET)
//     if(!res.id){
//       c.status(403)
//       return c.json({
//         msg : "Invalid credentials"
//       })
//     }

//     c.set("userId", String(res.id))
//     await next();
//   }
//   catch(e){
//     c.status(403)
//     return c.text("some error occurred")
//   }

// })




userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json()
    const { success, error } = signinInput.safeParse(body)
    if(!success) {
      c.status(411)
      return c.json({
        error ,
        msg : "invalid input"
      })
    }
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
  
userRouter.post('/signin', async (c)=>{
  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    // get the body, and find the user if it exsits
    const body = await c.req.json()
   try{
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

   }
   catch(e){
    c.status(403)
    return c.text("error occurred")
   }

    
})