import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if(!session)
        return res.status(401).json({message: "Unauthorized"});

    if(req.method==='PATCH')
    {
        try{
            const username = req.query.username;
            console.log(`Username: ${username}`);
            
            const client = await clientPromise;
            const db = client.db("AniDB");
            const users = db.collection("users");
    
            const currentUser = await users.findOne({email: session.user.email});
            if (!currentUser)
                return res.status(404).json({ error: "User not found" });

            const taken = await users.findOne({ username });
            if (taken) 
                return res.status(409).json({ error: "Username already taken" });
            
            await users.updateOne(
                { email: session.user.email },
                { $set:  {username: username}  }
            );

            return res.status(200).json({message: "Username updated"});
        }
        catch(error)
        {
            console.error("PATCH /api/user/username error:", error);
            return res.status(500).json({ error: "Server error" });   
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}