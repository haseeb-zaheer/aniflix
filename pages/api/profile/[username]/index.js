// sets username for profile

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
            const profiles = db.collection("profiles");

    
            const userProfile = await profiles.findOne({userId: session.user.id});
            if (!userProfile)
                return res.status(404).json({ error: "User not found" });

            const taken = await profiles.findOne({ username });
            if (taken) 
                return res.status(409).json({ error: "Username already taken" });
            
            await profiles.updateOne(
                { userId: session.user.id },
                { $set:  {username: username}  }
            );

            return res.status(200).json({message: "Username updated"});
        }
        catch(error)
        {
            console.error("PATCH /api/profile/username error:", error);
            return res.status(500).json({ error: "Server error" });   
        }
    }
    else {
        res.setHeader('Allow', ['PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}