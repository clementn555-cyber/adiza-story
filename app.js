// =====================================================
// ADIZA STORY — SITE PUBLIC
// Histoires récupérées depuis Supabase
// =====================================================


// =====================================================
// RÉCUPÉRER LES HISTOIRES PUBLIÉES
// =====================================================

async function getStories() {

  const { data, error } = await supabaseClient
    .from("stories")
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      status,
      created_at,
      categories (
        name,
        icon
      ),
      chapters (
        id
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {

    console.error(
      "Erreur lors de la récupération des histoires :",
      error
    );

    return [];

  }

  return (data || []).map(story => ({

    id: story.id,

    title: story.title,

    slug: story.slug,

    description:
      story.description ||
      "Découvrez cette histoire sur Adiza Story.",

    genre:
      story.categories?.name ||
      "Histoire",

    cover:
      story.cover_url ||
      story.categories?.icon ||
      "📖",

    chapters:
      story.chapters?.length || 0,

    status:
      story.status

  }));

}


// =====================================================
// AFFICHER UNE CARTE D'HISTOIRE
// =====================================================

function storyCard(story) {

  const cover = story.cover || "";

  const isImage =
    cover.startsWith("http://") ||
    cover.startsWith("https://");

  const coverContent = isImage
    ? `
      <img
        src="${escapeHtml(cover)}"
        alt="Couverture de ${escapeHtml(story.title)}"
        loading="lazy"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        "
      >
    `
    : `
      <span style="font-size:48px;">
        ${escapeHtml(cover || "📖")}
      </span>
    `;

  return `

    <a
      class="story-card"
      href="histoire.html?id=${encodeURIComponent(story.id)}"
    >

      <div class="cover">

        ${coverContent}

      </div>


      <div class="story-body">

        <span class="tag">

          ${escapeHtml(story.genre || "Histoire")}

        </span>


        <h3>

          ${escapeHtml(story.title)}

        </h3>


        <p>

          ${escapeHtml(
            story.description ||
            "Découvrez cette histoire sur Adiza Story."
          )}

        </p>


        <small>

          ${story.chapters || 0}

          chapitre(s)

        </small>

      </div>

    </a>

  `;
}


// =====================================================
// AFFICHER LES HISTOIRES
// =====================================================

async function renderStories() {

  const grid =
    document.getElementById("storyGrid");

  if (!grid) return;


  grid.innerHTML = `

    <div class="empty">

      Chargement des histoires...

    </div>

  `;


  let stories =
    await getStories();


  const params =
    new URLSearchParams(location.search);


  const genreFromUrl =
    params.get("genre");


  const search =
    document
      .getElementById("searchInput")
      ?.value
      ?.toLowerCase()
      ?.trim() || "";


  const selected =
    document
      .getElementById("genreFilter")
      ?.value ||
    genreFromUrl ||
    "";


  // ---------------------------------------------------
  // FILTRE
  // ---------------------------------------------------

  stories = stories.filter(story => {

    const matchesGenre =
      !selected ||
      story.genre === selected;


    const text = (

      story.title +
      " " +
      story.description

    ).toLowerCase();


    const matchesSearch =
      !search ||
      text.includes(search);


    return (
      matchesGenre &&
      matchesSearch
    );

  });


  // ---------------------------------------------------
  // AFFICHAGE
  // ---------------------------------------------------

  if (!stories.length) {

    grid.innerHTML = `

      <div class="empty">

        Aucune histoire trouvée.

      </div>

    `;

    return;

  }


  grid.innerHTML =
    stories
      .map(storyCard)
      .join("");

}


// =====================================================
// PROTECTION CONTRE LE HTML
// =====================================================

function escapeHtml(value = "") {

  return String(value).replace(

    /[&<>"']/g,

    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])

  );

}


// =====================================================
// MODE SOMBRE / CLAIR
// =====================================================

function setupTheme() {

  const button =
    document.getElementById("themeToggle");

  if (!button) return;


  const saved =
    localStorage.getItem("adizaTheme");


  if (saved === "light") {

    document.body.classList.add("light");

  }


  button.onclick = () => {

    document.body.classList.toggle("light");


    localStorage.setItem(

      "adizaTheme",

      document.body.classList.contains("light")
        ? "light"
        : "dark"

    );

  };

}


// =====================================================
// INITIALISATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const year =
      document.querySelector("#year");


    if (year) {

      year.textContent =
        new Date().getFullYear();

    }


    setupTheme();


    await renderStories();


    document
      .getElementById("searchInput")
      ?.addEventListener(
        "input",
        renderStories
      );


    document
      .getElementById("genreFilter")
      ?.addEventListener(
        "change",
        renderStories
      );

  }
);