import axios from "axios";

export default async function handler(req, res)
{
    if(req.method==='GET') {
        const {id} = req.query;
        try {
            const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
            const animeData = response.data;
            console.log(animeData);

            res.status(200).json(animeData);
        }
        catch(error) {
            console.error('Error fetching anime:', error.message);
            res.status(500).json({ error: 'Failed to fetch anime data' });
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}