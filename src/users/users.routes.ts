import express, {Request, Response} from "express"
import { UnitUser, User } from "./user.interface"
import {StatusCodes} from "http-status-codes"
import { searchUsers } from "./user.database";
import * as database from "./user.database"

export const userRouter = express.Router()


userRouter.get("/users", async (req : Request, res : Response) => {
    try {
        const allUsers : UnitUser[] = await database.findAll()

        if(!allUsers) {
            return res.status(StatusCodes.NOT_FOUND).json({msg : `No users at this time...`})
        }

        return res.status(StatusCodes.OK).json({total_user : allUsers.length, allUsers})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})



//Name and Email//
userRouter.get("/users/search", async (req: Request, res: Response) => {
    try {

        const name = req.query.name as string;
        const email = req.query.email as string;

        const users = await searchUsers(name, email);

        return res.status(StatusCodes.OK).json({ users });
    } catch (error) {
        return res.status(StatusCodes.NOT_FOUND).json( [] );
    }
});



userRouter.get("/user/:id", async (req : Request, res : Response) => {
    try {
        const user : UnitUser = await database.findOne(req.params.id)

        if(!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `User not found!`})
        }

        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})



userRouter.post("/register", async (req : Request, res : Response) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Please provide all the required parameters..`})
        }

        const user = await database.findByEmail(email)

        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `This email has already been registerd,,`})
        }

        const newUser = await database.create(req.body)

        return res.status(StatusCodes.CREATED).json({newUser})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.post("/login", async (req : Request, res : Response) => {
    try {
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : "Please provide all the required parameters"})
        }

        const user = await database.findByEmail(email)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : "No user exists with the email.."})
        }

        const comparePassword = await database.comparePassword(email, password)

        if (!comparePassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Incorrect password`})
        }

        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.put('/user/:id', async (req : Request, res : Response) => {
    try {
        const {username, email, password} = req.body

        const getUser = await database.findOne(req.params.id)

        if(!username || !email || !password) {
            return res.status(401).json({error : `Please provide all the required parameters..`})
        }


        if (!getUser) {
            return res.status(404).json({error : `No user with the id ${req.params.id}`})
        }

        const updateUser = await database.update((req.params.id), req.body)

        return res.status(201).json({updateUser})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

userRouter.delete("/user/:id", async (req : Request, res : Response) => {
    try {
        const id = (req.params.id)

        const user = await database.findOne(id)

        if(!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `User does not exists`})
        }

        await database.remove(id)

        return res.status(StatusCodes.OK).json({msg : "User deleted"})
    } catch (error) {   
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})



function searchUsersByName(name: string) {
    throw new Error("Function not implemented.")
}
 