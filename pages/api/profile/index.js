// sends back user profile, or updates it

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
            const client = await clientPromise;
            const db = client.db("AniDB");
            const profiles = db.collection("profiles");
            
            const userId = session.user.id;

            const userProfile = await profiles.findOne({userId: userId});
            console.log(userProfile);
            return res.status(200).json({ username: userProfile.username });
        }catch(error)
        {
            console.error("Error fetching profile:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else if(req.method==='PATCH')
    {
        try{
            const client = await clientPromise;
            const db = client.db("AniDB");
            const profiles = db.collection("profiles");
            
            const userId = session.user.id;
            const updateFields = {};

            if (req.body.description !== undefined)
                updateFields.description = req.body.description;

            if (req.body.profilePicture !== undefined)
                updateFields.profilePicture = req.body.profilePicture;

            if (req.body.bannerImage !== undefined)
                updateFields.bannerImage = req.body.bannerImage;

            updateFields.updatedAt = new Date();

            await profiles.updateOne({ userId }, { $set: updateFields });
            return res.status(200).json({
                message: "Profile updated",
                updated: updateFields
              });
        }catch(error)
        {
            console.error("Error updating profile: ", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else {
        res.setHeader('Allow', ['GET', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}