import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) 
    return res.status(401).json({ message: "Unauthorized" });

  const animeId = parseInt(req.query.animeId);
  if (isNaN(animeId)) {
    return res.status(400).json({ message: "Invalid anime ID" });
  }

  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("AniDB");
      const animeList = db.collection("animeList");
      const profiles = db.collection("profiles");

      const userId = session.user.id;
      const { animeTitle, status, userScore, episodesWatched, totalEpisodes, imageUrl } = req.body;

      const existing = await animeList.findOne({ userId, animeId });
      const wasCompleted = existing?.status === "completed";
      const isCompleted = status === "completed";

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
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (!wasCompleted && isCompleted) {
        await profiles.updateOne(
          { userId },
          { $inc: { totalAnimeWatched: 1 }, $set: { updatedAt: new Date() } }
        );
      }

      if (wasCompleted && !isCompleted) {
        await profiles.updateOne(
          { userId },
          { $inc: { totalAnimeWatched: -1 }, $set: { updatedAt: new Date() } }
        );
      }

      return res.status(200).json({ message: "Anime added to watch list" });
    } catch (error) {
      console.error("POST /api/watchlist/[animeId] error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
  else if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("AniDB");
      const animeList = db.collection("animeList");

      const userId = session.user.id;

      const existing = await animeList.findOne({ userId, animeId });
      return res.status(200).json({ anime: existing });
    } catch (error) {
      console.error("GET /api/watchlist/[animeId] error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
  else if (req.method === "PATCH") {
    try {
      const client = await clientPromise;
      const db = client.db("AniDB");
      const animeList = db.collection("animeList");

      const userId = session.user.id;
      const existing = await animeList.findOne({ userId, animeId });

      if (!existing) 
        return res.status(404).json({ error: "Anime not found in user's watchlist" });
      

      const { status, userScore, episodesWatched } = req.body;

      await animeList.updateOne(
        { userId, animeId },
        {
          $set: {
            status,
            userScore,
            episodesWatched,
            updatedAt: new Date(),
          },
        }
      );

      return res.status(200).json({ message: "Anime watchlist entry updated" });
    } 
    catch (error) {
      console.error("PATCH /api/watchlist/[animeId] error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
  else {
    res.setHeader("Allow", ["POST", "GET", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
