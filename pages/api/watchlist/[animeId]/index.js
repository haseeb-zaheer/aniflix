// POST or GET an anime to user watchlist

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
            if (isNaN(animeId)) {
              return res.status(400).json({ message: 'Invalid anime ID' });
            }
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
    else if (req.method==='GET')
    {
      try{
        console.log('Attempting to get user specific anime from watchlist');
        const animeId = parseInt(req.query.animeId);
        if (isNaN(animeId)) {
          return res.status(400).json({ message: 'Invalid anime ID' });
        }

        const client = await clientPromise;
        const db = client.db("AniDB");
        const animeList = db.collection("animeList");
        
        const userId = session.user.id;

        const existingAnime = await animeList.findOne({userId: userId, animeId: animeId});
        console.log(existingAnime);
        return res.status(200).json({ anime: existingAnime });

      }catch(error)
      {
        console.error("GET /api/watchList/[animeId] error:", error);
        return res.status(500).json({ error: "Server error" }); 
      }
    }
    else if (req.method === 'PATCH') {
      try {
        const animeId = parseInt(req.query.animeId);
        if (isNaN(animeId)) {
          return res.status(400).json({ message: 'Invalid anime ID' });
        }
    
        const client = await clientPromise;
        const db = client.db("AniDB");
        const animeList = db.collection("animeList");
        const userId = session.user.id;
    
        const existingAnime = await animeList.findOne({ userId, animeId });
        if (!existingAnime) {
          return res.status(404).json({ error: "Anime not found in user's watchlist" });
        }
    
        const { status, userScore, episodesWatched } = req.body;
    
        await animeList.updateOne(
          { userId, animeId },
          {
            $set: {
              status,
              userScore,
              episodesWatched,
              updatedAt: new Date()
            }
          }
        );
    
        return res.status(200).json({ message: "Anime watchlist entry updated" });
      } catch (error) {
        console.error("PATCH /api/watchlist/[animeId] error:", error);
        return res.status(500).json({ error: "Server error" });
      }
    }
    else{
      res.setHeader('Allow', ['POST', 'GET', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
}