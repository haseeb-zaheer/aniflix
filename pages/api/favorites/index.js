import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if (!session)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === 'GET')
    {
        try{
            const client = await clientPromise;
            const db = client.db("AniDB");
            const favorites = db.collection("favorites");
            const userId = session.user.id;

            const favoritesList = await favorites.find({ userId }).toArray();

            return res.status(200).json({favoritesList});
        }
        catch(error)
        {
            console.error("GET /api/favorites/ error:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }
    else
    {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}