import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    const { search, page = 1, perPage = 12 } = req.query;

    if (!search || typeof search !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid search query' });
    }

    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          media(search: $search, type: ANIME, isAdult: false) {
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

    const variables = {
      search,
      page: parseInt(page),
      perPage: parseInt(perPage),
    };

    try {
      const response = await axios.post(
        'https://graphql.anilist.co',
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const data = response.data.data.Page;
      const animeData = Array.isArray(data.media) ? data.media : [];
      const hasNextPage = data.pageInfo?.hasNextPage ?? false;

      res.status(200).json({ results: animeData, hasNextPage });
    } catch (error) {
      console.error('Error fetching from AniList:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to fetch anime data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
