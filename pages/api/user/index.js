// sends back user
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if(!session)
        return res.status(401).json({message: "User not logged in"});
    if(req.method==='GET')
    {
        try{
            console.log('Attempting to get user');
    
            const client = await clientPromise;
            const db = client.db("AniDB");
            const users = db.collection("users");
            
            const userEmail = session.user.email;

            const existingUser = await users.findOne({email: userEmail});
            console.log(existingUser);
            return res.status(200).json(existingUser);
        }catch(error)
        {
            console.error("Error fetching user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}