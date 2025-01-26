//routes/main.js
import { Router } from "express"
import { getEpisodeInfo, searchAnime } from "../lib/index.js"
import { filterEpisodes } from "../lib/utils.js"
import { getEpisodePlayer } from '../lib/index.js';


const router = Router()

router.get("/search", async (req, res) => {
  const query = req.query.q

  if (!query) return res.status(400).json({ message: "Query not provided" })

  try {
    const result = await searchAnime(query)

    if (!result.length || result === null) return res.status(404).json({ message: "Anime not found" })

    return res.status(200).json({ result })
  } catch (err) {
    console.error(err)
  }
})

router.get("/:anime", async (req, res) => {
  try {
    const anime = req.params.anime
    // const info = await getEpisodeInfo(anime)

    // if (!info.data) return res.status(404).json({ message: "Anime not found" })

    // const { data, ...response } = info
    const { data, ...response } = await getEpisodeInfo(anime)

    if (!data || data === null || data === undefined) return res.status(404).json({ message: "Anime not found" })

    res.json({ ...response, episodes: filterEpisodes(data) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/:anime/:episode", async (req, res) => {
  const { anime, episode } = req.params;

  try {
    const episodeInfo = await getEpisodePlayer(anime, episode);
    if (!episodeInfo || !episodeInfo.playerUrl) {
      return res.status(404).json({ message: "Episódio não encontrado ou sem player disponível." });
    }

    return res.status(200).json(episodeInfo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar o episódio." });
  }
});

export default router