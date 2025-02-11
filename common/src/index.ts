import z from "zod"

export const signupInput = z.object({
  email : z.string().email(),
  password : z.string().min(8),
  name : z.string().optional()
})
export const signinInput = z.object({
  email : z.string().email(),
  password : z.string().min(8),
})

// type inference in zod for the frontend part  


// define a common module and shift all the zod validation and type inferencing into the common folder

export const createBlogInput = z.object({
    title : z.string(),
    content : z.string()
})

export const updateBlogInput = z.object({
    title : z.string(),
    content : z.string(),
    id : z.string()
})
export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>

// since we are not using monorepos therefore we are using it via npm package way


// export the npm package and then use them