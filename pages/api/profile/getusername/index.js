import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if(!session)
        return res.status(401).json({message: "User not logged in"});
    
    if(req.method==='GET')
    {
        try{
            const client = await clientPromise;
            const db = client.db("AniDB");
            const profiles = db.collection("profiles");
            
            const userId = session.user.id;

            const userProfile = await profiles.findOne({userId: userId});
            console.log(userProfile.username);
            return res.status(200).json({ username: userProfile.username });
        }catch(error)
        {
            console.error("Error fetching username:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}