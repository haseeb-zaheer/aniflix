// add an anime to user watchlist

import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res)
{
    const session = await getServerSession(req, res, authOptions);
    if(!session)
        return res.status(401).json({message: 'Unauthorized'});

    if(req.method==='POST')
    {
        try{
            const client = await clientPromise;
            const db = client.db('AniDB');
            const animeList = db.collection("animeList");
            const animeId = parseInt(req.query.animeId);
            const userId = session.user.id;
            const {animeTitle, status, userScore, episodesWatched, totalEpisodes, imageUrl} = req.body;

            await animeList.updateOne(
              { userId, animeId }, 
              {
                $set: {
                  animeTitle,
                  status,
                  userScore,
                  episodesWatched,
                  totalEpisodes,
                  imageUrl,
                  updatedAt: new Date()
                },
                $setOnInsert: {
                  createdAt: new Date()
                }
              },
              { upsert: true } 
            );
            
            return res.status(200).json({message: 'Anime added to watch list'});
        }
        catch(error)
        {
          console.error("POST /api/watchList/[animeId] error:", error);
          return res.status(500).json({ error: "Server error" }); 
        }
    }
    else{
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
}