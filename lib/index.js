//lib/index.js
import { load } from "cheerio"
import axios from 'axios';
import {
  fetcher,
  getEpisodeNumber,
  getPublicationDate,
  replaceSpacesWithHyphens,
  sortedDate
} from "./utils.js"

const animeUrl = "https://animefire.plus/animes/"
const allEpisodes = "-todos-os-episodios"

async function requestData(name) {
  const url = `${animeUrl}${name}${allEpisodes}`

  try {
    const { data } = await fetcher(url)

    if (!data || data === undefined || data === null) return // { message: "Anime not found" }

    const $ = load(data)
    const links = []
    const genres = []

    const description = $(".divSinopse > .spanAnimeInfo").text()
    const animeTitle = $(".div_anime_names > .quicksand400").text()
    const englishTitle = $(".div_anime_names > h6").eq(0).text()
    const studio = $(".animeInfo > span").eq(1).text()
    const type = $(".animeInfo > span").eq(2).text()
    const imageUrl = $(".sub_animepage_img > img").attr("data-src")

    $(".animeInfo").find(".mr-1").each((i, el) => {
      genres.push($(el).text())

      return genres
    })

    $("a").each((i, el) => {
      const link = $(el).attr("href")

      if (!link.includes(`${animeUrl}${name}`) || link.includes(allEpisodes)) return

      return links.push(link)
    })

    return { links, animeTitle, englishTitle, studio, genres, description, type, imageUrl }
  } catch (err) {
    console.error(err)

    return
  }
}

export async function searchAnime(query) {
  const params = replaceSpacesWithHyphens(query); // Substitui espaços por hífens
  const url = `https://animefire.plus/pesquisar/${params}`; // URL de busca no site

  try {
    const { data } = await fetcher(url);
    if (!data) return null;

    const $ = load(data);
    const animesResults = [];

    // Selecionar todos os resultados relacionados
    $(".divCardUltimosEps").each((i, el) => {
      const animeName = $(el).find(".imgAnimes").attr("alt");
      const thumbnail = $(el).find(".imgAnimes").attr("data-src");
      const animeLink = $(el).find("a").attr("href");

      animesResults.push({
        animeName,
        thumbnail: thumbnail.startsWith("http") ? thumbnail : `https://animefire.plus${thumbnail}`,
        animeLink: animeLink.startsWith("http") ? animeLink : `https://animefire.plus${animeLink}`,
      });
    });

    return animesResults;
  } catch (err) {
    console.error("Erro ao buscar animes:", err);
    return [];
  }
}


export async function getEpisodeInfo(anime) {
  const res = await requestData(anime)
  const response = []

  if (!res || !res.links) return null

  const { links, ...args } = res
  
  // Use Promise.all to fetch all episode pages concurrently
  await Promise.all(links.map(async link => {
    try {
      const { data } = await fetcher(link)
      const $ = load(data)

      let episodeName = $(".sectionVideoEpTitle").text()
      let responseEpisode = $("video").attr("data-video-src")
      let publicationDate = $("li > h6").text()

      if (episodeName && responseEpisode) {
        response.push({
          episodeNumber: getEpisodeNumber(episodeName),
          episode: responseEpisode,
          date: getPublicationDate(publicationDate),
        })
      }
    } catch (err) {
      console.error(`Error fetching episode: ${link}`, err)
    }
  }))

  // Remove duplicates and sort by date
  const uniqueData = Array.from(new Set(response.map(JSON.stringify))).map(JSON.parse)
  const sortedEpisodes = sortedDate(uniqueData)

  return { result: args, data: sortedEpisodes }
}

export async function getEpisodePlayer(anime, episodeNumber) {
  const url = `https://animefire.plus/animes/${anime}/${episodeNumber}`;

  try {
    const { data } = await fetcher(url);
    if (!data) return null;

    const $ = load(data);
    const playerUrl = $("video").attr("data-video-src");
    
    const response = await axios.get(playerUrl);
    const streamLinks = response.data.data;
    const streamLink = streamLinks[0].src;

    return {
      episodeNumber,
      episodeTitle: $(".sectionVideoEpTitle").text(),
      playerUrl,
      streamLink
    };
  } catch (err) {
    console.error(`Erro ao buscar o player do episódio ${episodeNumber}:`, err);
    return null;
  }
}