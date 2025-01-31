import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings:{
    DATABASE_URL : string,
    JWT_SECRET : string
  },
  Variables:{
    userId : string
  }
}>();



blogRouter.use('/*' ,async (c, next)=>{
  // extract the user id and pass it down to the route handler
  const header = c.req.header('Authorization') || ""
  const token = header.split(" ")[1]
  try{
    const res = await verify(token , c.env.JWT_SECRET)

    if(!res.id){
      c.status(403)
      return c.json({
        msg : "invalid creds"
      })
    }
    
    const userId = res.id;
    c.set('userId' , String(userId) )
    await next()
  }catch{
    c.status(411)
    return c.json({
      msg : "some error occured at middleware"
    })
  }
  
})

blogRouter.post('/', async (c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    const userId = c.get("userId")

    const body = await c.req.json()

    try{
      const blog = await prisma.post.create({
        data:{
          title : body.title,
          content : body.content,
          authorId : userId,
          published : true
        }
      })
      c.status(200)
      return c.json({
        blog : blog
      })
    }
    catch(e){
      c.status(403);
      return c.json({
        msg : "some error occured while creating the blog post"
      })
    }
    
})
  
blogRouter.put('/', async (c)=>{
  const body = await c.req.json()
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  // const updateRes = await prisma.blog.update({
  //   where:{
  //     id : body.id
  //   },
  //   data:{
  //     title : body.title,
  //     content : body.content
  //   }

  // })

  // return c.json({
  //   id : updateRes.id
  // })
  const userId = c.get("userId")
  try{
    const updateBlog = await prisma.post.update({
      where:{
        authorId : userId,
        id : body.id
      },
      data:{
        title : body.title,
        content : body.content
      }
    })
    c.status(200)
    return c.json({
      updatedBlog : updateBlog,
      msg :"blog updated successfully"
    })
  }
  catch(e){
    c.status(403)
    return c.json({
      msg : "some error occured while updating the blog"
    })
  }
})

blogRouter.get('/bulk/:pageNumber', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

// Implemennting pagination
// the user will provide which page he is on in params,
  const pageNumber = Number(c.req.param("pageNumber")) || 1
  const pageSize = 5
  const skipBlogCount = (pageNumber-1)*pageSize
  const takeBlogCount = 0


  try{
    const allBlogs = await prisma.post.findMany({
      skip : skipBlogCount,
      take : pageSize,

      orderBy:{
        title : 'desc'
      }
    })
    // let count  = 0
    // allBlogs.forEach(e =>{
    //   count++;
    // })
    
    c.status(200)
    return c.json({
      blogs : allBlogs
    })
  }catch(e){
    c.status(403)
    return c.text("some error occurred")
  }
})


blogRouter.get('/:id', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id  = c.req.param("id")
  try{
    const blogFound  = await prisma.post.findUnique({
      where:{
        id : id
      }
    })
    if(!blogFound){
      c.status(411)
      return c.json({
        msg : "blog not found"
      })
    }

    c.status(200)
    return c.json(
      {blog : blogFound}
    )
  }
  catch(e){
    c.status(403)
    return c.json({
      msg : "some error occurred"
    })
  }
})
