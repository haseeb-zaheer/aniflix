export default function getCurrentSeasonAndYear(){
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let season = '';
    if (month >= 0 && month < 3) season = 'WINTER';
    else if (month >= 3 && month < 6) season = 'SPRING';
    else if (month >= 6 && month < 9) season = 'SUMMER';
    else season = 'FALL';

    return { season, year };
};