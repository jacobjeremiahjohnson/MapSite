import axios from 'axios';


export default function fetchCityCoords(state: string, cities: Array<string>) {

    const url = new URL(`https://iow6swr5ug.execute-api.us-east-1.amazonaws.com/prod/cities`);
    url.searchParams.set('state', state)
    url.searchParams.set('cities', cities.join(','))
    return axios.get(url.toString()).then(response => response.data);
}
