import axios from "axios";

export default async function handler(req,res)
{
    if(req.method==='GET')
    {
        const { q = '' } = req.query;
        console.log(q);
        try{
            const response = await axios.get('https://api.jikan.moe/v4/anime',{
                params:{
                    q,
                    limit:10,
                }
            });
            const animeList = response.data;
            console.log(animeList);

            res.status(200).json(animeList);
        }
        catch (error){
            console.error('Error fetching anime:', error.message);
            res.status(500).json({ error: 'Failed to fetch anime data' });
        }
    }
    else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}