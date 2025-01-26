// server.js
import express from "express";
import cors from "cors";
import { readJsonFile } from "./lib/utils.js";
import router from "./routes/main.js";
import puppeteer from "puppeteer"; // Importa o Puppeteer para simular o navegador

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("json spaces", 2);

// Endpoint raiz
app.get("/", (req, res) => {
  const myList = readJsonFile("./assets/animes.json");
  return res
    .status(200)
    .json({ endpoints: ["/anime", "search?q="], animesAvaliable: myList });
});

// Rota de anime
app.use("/anime", router);

// Nova rota para simular o navegador e acessar o vídeo
app.get("/stream-video", async (req, res) => {
  const videoURL = req.query.url; // URL do vídeo fornecida na query string

  if (!videoURL) {
    return res.status(400).json({ error: "URL do vídeo não fornecida." });
  }

  try {
    // Inicializa o Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // Modo headless para rodar em segundo plano
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Opções de segurança
    });

    const page = await browser.newPage();

    // Define o User-Agent para simular um navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    // Configura o cabeçalho Referer, caso necessário
    await page.setExtraHTTPHeaders({
      Referer: "https://lightspeedst.net", // Referer exigido pelo servidor
    });

    // Navega até a URL do vídeo
    await page.goto(videoURL, { waitUntil: "networkidle2", timeout: 0 });

    // Fecha o navegador
    await browser.close();

    // Retorna a URL do vídeo como resposta (ou você pode ajustar para enviar o conteúdo)
    res.status(200).json({ message: "Acesso realizado com sucesso!", url: videoURL });
  } catch (error) {
    console.error("Erro ao acessar o vídeo:", error.message);
    res.status(500).json({ error: "Erro ao acessar o vídeo.", details: error.message });
  }
});

// Rota padrão para 404
app.use((req, res) => {
  return res.status(404).json({ message: "Page not found" });
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
