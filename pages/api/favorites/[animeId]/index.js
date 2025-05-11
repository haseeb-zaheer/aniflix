import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if (!session)
        return res.status(401).json({ message: "Unauthorized" });

    const animeId = parseInt(req.query.animeId);
    if (isNaN(animeId)) {
      return res.status(400).json({ message: "Invalid anime ID" });
    }

    if (req.method === 'POST')
    {
        try{
            const client = await clientPromise;
            const db = client.db('AniDB');
            const favoritesList = db.collection('favorites');
            const { title, rating, episodes, image } = req.body;
        
            if (!title || !image) 
                return res.status(400).json({ message: 'Missing fields' });

            const userId = session.user.id;

            await favoritesList.updateOne(
                { userId, animeId },
                {
                  $set: {
                    title,
                    rating,
                    episodes,
                    image,
                    updatedAt: new Date(),
                  },
                  $setOnInsert: {
                    createdAt: new Date(),
                  },
                },
                { upsert: true }
            );
            return res.status(200).json({ message: "Anime added to favorite list" });
        }
        catch(error)
        {
            console.error("POST /api/favorites/[animeId] error:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }
    else if (req.method === 'GET')
    {
        try{
            const client = await clientPromise;
            const db = client.db('AniDB');
            const favoritesList = db.collection('favorites');
            const userId = session.user.id;

            const favorite = await favoritesList.findOne({userId, animeId});
            return res.status(200).json({ favorite });
        }
        catch(error)
        {
            console.error("GET /api/favorites/[animeId] error:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }
    else if (req.method === 'DELETE')
    {
        try{
            const client = await clientPromise;
            const db = client.db('AniDB');
            const favoritesList = db.collection('favorites');
            const userId = session.user.id;

            await favoritesList.deleteOne({userId, animeId});
            return res.status(200).json({ message: 'Anime Deleted' });
        }
        catch(error)
        {
            console.error("DELETE /api/favorites/[animeId] error:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }
    else
    {
        res.setHeader("Allow", ["POST", "GET", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}