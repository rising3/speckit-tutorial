import "./styles/main.css";
import "./styles/main.css";
import PhotoImport from "./components/PhotoImport.js";
import AlbumCreate from "./components/AlbumCreate.js";
import AlbumList from "./components/AlbumList.js";
import AlbumView from "./components/AlbumView.js";

const app = document.getElementById("app");

async function render() {
  app.innerHTML = "<h1>Photo Album Organizer</h1>";

  const importEl = PhotoImport({
    onPhotosImported: () => render(),
  });
  app.appendChild(importEl);

  const createEl = AlbumCreate({
    onAlbumsCreated: () => render(),
  });
  app.appendChild(createEl);

  const albumListEl = await AlbumList({
    onAlbumSelect: async (album) => {
      const albumViewEl = await AlbumView({ album });
      app.innerHTML = "<h1>Photo Album Organizer</h1>";
      app.appendChild(importEl);
      app.appendChild(createEl);
      app.appendChild(albumListEl);
      app.appendChild(albumViewEl);
    },
  });
  app.appendChild(albumListEl);
}

render();
