import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;

    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          episodes
          averageScore
          genres
          status
          startDate {
            year
            month
            day
          }
        }
      }
    `;

    const variables = { id: parseInt(id) };

    try {
      const response = await axios.post(
        'https://graphql.anilist.co',
        {
          query,
          variables
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const animeData = response.data.data.Media;
      res.status(200).json(animeData);
    } catch (error) {
      console.error('Error fetching from AniList:', error.message);
      res.status(500).json({ error: 'Failed to fetch anime data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
