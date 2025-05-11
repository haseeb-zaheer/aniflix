import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ message: "Unauthorized" });

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const genre = req.query.genre && req.query.genre !== 'All' ? req.query.genre : null;

    const POPULAR_ANIME_QUERY = `
      query ($page: Int, $genre: String) {
        Page(perPage: 12, page: $page) {
          media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, genre: $genre) {
            id
            title {
              romaji
            }
            coverImage {
              large
            }
            episodes
            averageScore
            genres
          }
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: POPULAR_ANIME_QUERY,
          variables: { page, genre }
        })
      });

      if (!response.ok) 
        throw new Error("AniList API error");

      const result = await response.json();
      const popularAnime = result.data.Page.media;

      res.status(200).json(popularAnime);
    } catch (error) {
      console.error("Error fetching AniList popular anime:", error.message);
      res.status(500).json({ error: "Failed to fetch popular anime" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
