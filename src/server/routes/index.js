import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import React from "react";
import { renderToString } from "react-dom/server";
import { fetchNowPlayingMovieItems } from "../../apis/fetchMovies";
import Header from "../../client/components/Header";
import Home from "../../client/components/Home";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/", async (_, res) => {
  const templatePath = path.join(__dirname, "../../../views", "index.html");

  try {
    const template = fs.readFileSync(templatePath, "utf-8");
    const movies = (await fetchNowPlayingMovieItems()) || [];
    const renderedApp = renderToString(<Home movies={movies} />);
    const renderedHeader = renderToString(<Header movie={movies[0]} />);
    const initData = template.replace(
      "<!--${INIT_DATA_AREA}-->",
      /*html*/ `
      <script>
        window.__INITIAL_DATA__ = {
          movies: ${JSON.stringify(movies)}
        }
      </script>
    `
    );

    const headerHtml = initData.replace(
      "<!--${HEADERS_PLACEHOLDER}-->",
      renderedHeader
    );

    const renderedHTML = headerHtml.replace(
      "<!--${MOVIE_ITEMS_PLACEHOLDER}-->",
      renderedApp
    );

    res.send(renderedHTML);
  } catch (error) {
    console.error("Error during rendering:", error);
    res.status(500).send("An error occurred while rendering the page");
  }
});

export default router;
