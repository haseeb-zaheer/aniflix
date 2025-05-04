// POST req to add an anime to the userlist

import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if(!session)
        return res.status(401).json({message: 'Unauthorized'});

    if(req.method==='GET')
    {
        try{
            const client = await clientPromise;
            const db = client.db('AniDB');
            const animeList = db.collection('animeList');

            const userList = await animeList.find({userId: session.user.id}).toArray();
            
            return res.status(200).json(userList);
        }
        catch(error)
        {
            console.error("GET /api/watchList/ error:", error);
            return res.status(500).json({ error: "Server error" }); 
        }
    }
    else
    {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    
}