// =====================================================
// ADIZA STORY — LECTEUR D'HISTOIRES
// Version Supabase
// =====================================================


// =====================================================
// RÉCUPÉRER L'HISTOIRE
// =====================================================

async function getStory() {

  const id =
    new URLSearchParams(location.search).get("id");

  if (!id) {
    return null;
  }


  const { data, error } =
    await supabaseClient

      .from("stories")

      .select(`
        id,
        title,
        description,
        cover_url,
        status,

        categories (
          name,
          icon
        ),

        chapters (
          id,
          chapter_number,
          title,
          content
        )
      `)

      .eq("id", id)

      .eq("status", "published")

      .single();


  if (error) {

    console.error(
      "Erreur récupération histoire :",
      error
    );

    return null;
  }


  // Trier les chapitres dans l'ordre
  if (data && data.chapters) {

    data.chapters.sort(
      (a, b) =>
        a.chapter_number - b.chapter_number
    );

  }


  return data;

}


// =====================================================
// AFFICHER L'HISTOIRE
// =====================================================

async function renderReader() {

  const reader =
    document.getElementById("reader");


  if (!reader) return;


  reader.innerHTML = `

    <div class="empty">

      Chargement de l'histoire...

    </div>

  `;


  const story =
    await getStory();


  if (!story) {

    reader.innerHTML = `

      <div class="empty">

        <h2>📖 Histoire introuvable</h2>

        <p>
          Cette histoire n'existe pas,
          ou elle n'est pas encore publiée.
        </p>

        <br>

        <a href="histoires.html">
          ← Retour à la bibliothèque
        </a>

      </div>

    `;

    return;

  }


  const genre =
    story.categories
      ? `${story.categories.icon || ""} ${story.categories.name}`
      : "📖 Histoire";


  const chapters =
    story.chapters || [];


  reader.innerHTML = `

    <!-- ========================================= -->
    <!-- EN-TÊTE DE L'HISTOIRE -->
    <!-- ========================================= -->

    <div class="reader-header">

      <div class="cover">
  ${
    story.cover_url
      ? `
        <img
          src="${escapeHtml(story.cover_url)}"
          alt="Couverture de ${escapeHtml(story.title)}"
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
          ${escapeHtml(
            story.categories?.icon || "📖"
          )}
        </span>
      `
  }
</div>


      <span class="tag">

        ${escapeHtml(genre)}

      </span>


      <h1>

        ${escapeHtml(story.title)}

      </h1>


      <p>

        ${escapeHtml(
          story.description || ""
        )}

      </p>

    </div>


    <!-- ========================================= -->
    <!-- CHAPITRES -->
    <!-- ========================================= -->

    <div class="chapter-list">

      ${
        chapters.length

          ? chapters.map(chapter => `

              <article class="chapter">

                <h2>

                  Chapitre
                  ${chapter.chapter_number}

                  —
                  ${escapeHtml(
                    chapter.title
                  )}

                </h2>


                ${formatContent(
                  chapter.content
                )}

              </article>

            `).join("")

          : `

            <div class="empty">

              Aucun chapitre disponible
              pour le moment.

            </div>

          `
      }

    </div>


    <!-- ========================================= -->
    <!-- NAVIGATION -->
    <!-- ========================================= -->

    <div class="reader-nav">

      <a href="histoires.html">

        ← Bibliothèque

      </a>


      <a href="histoires.html">

        Autres histoires →

      </a>

    </div>

  `;

}


// =====================================================
// FORMATER LE TEXTE
// =====================================================

function formatContent(content = "") {

  return String(content)

    .split(/\n+/)

    .filter(paragraph => paragraph.trim())

    .map(paragraph => `

      <p>

        ${escapeHtml(
          paragraph.trim()
        )}

      </p>

    `)

    .join("");

}


// =====================================================
// PROTECTION HTML
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


    await renderReader();

  }
);