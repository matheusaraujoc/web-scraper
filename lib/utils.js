//lib/utils.js
import axios from "axios"
import fs from "fs"

// Em utils.js
export async function fetcher(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://animefire.plus/'
      }
    });
    return { data: response.data };
  } catch (err) {
    console.error(`Erro ao buscar URL ${url}:`, err.message);
    return null;
  }
}

export function getPublicationDate(text) {
  const match = text.match(/Publicado Dia: (\d{2}\/\d{2}\/\d{4})/)

  return match ? match[1] : null
}

export function getEpisodeNumber(text) {
  const match = text.match(/Episódio (\d+)/)

  return match ? match[1] : null
}

export function sortedDate(date) {
  date.sort((a, b) => {
    const dateA = new Date(a.date.split("/").reverse().join("-"))
    const dateB = new Date(b.date.split("/").reverse().join("-"))

    return dateB - dateA
  })

  return date
}

export function replaceSpacesWithHyphens(str) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export function readJsonFile(filePath) {
  try {
    const json = fs.readFileSync(filePath, "utf-8")
    const jsonFormat = JSON.parse(json)

    return jsonFormat
  } catch (err) {
    console.error(err)
  }
}

export function filterEpisodes(data) {
  // if (!data.episodes) console.info("Episodes not found")

  return data.filter(episode => episode.date && episode.episode)
}
