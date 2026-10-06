/* =========================================================
   ADIZA STORY — ADMIN.JS
   Gestion complète de l'administration
   ========================================================= */


/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let allAdminStories = [];


/* =========================================================
   UTILITAIRES
   ========================================================= */

/**
 * Échappe le HTML pour éviter d'injecter du contenu directement
 * dans la page.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/**
 * Transforme un texte en slug.
 */
function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/**
 * Vérifie si une couverture est une vraie image.
 */
function isImageUrl(url) {
  return (
    typeof url === "string" &&
    (
      url.startsWith("http://") ||
      url.startsWith("https://")
    )
  );
}


/* =========================================================
   RÉCUPÉRER LES HISTOIRES
   ========================================================= */

async function getStoriesFromSupabase() {
  const {
    data,
    error
  } = await supabaseClient
    .from("stories")
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      author,
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
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Erreur lors du chargement des histoires :",
      error
    );

    throw error;
  }

  return data || [];
}


/* =========================================================
   AFFICHER LES STATISTIQUES
   ========================================================= */

function updateAdminStats(stories) {
  const countElement =
    document.getElementById("count");

  const publishedElement =
    document.getElementById("publishedCount");

  const draftElement =
    document.getElementById("draftCount");


  const publishedStories =
    stories.filter(
      story => story.status === "published"
    );

  const draftStories =
    stories.filter(
      story => story.status === "draft"
    );


  if (countElement) {
    countElement.textContent =
      stories.length;
  }


  if (publishedElement) {
    publishedElement.textContent =
      publishedStories.length;
  }


  if (draftElement) {
    draftElement.textContent =
      draftStories.length;
  }
}


/* =========================================================
   AFFICHER LES HISTOIRES
   ========================================================= */

function renderStories(stories) {
  const list =
    document.getElementById("list");

  if (!list) {
    return;
  }


  /* Aucune histoire */

  if (!stories.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div style="font-size:40px;">
          🔎
        </div>

        <h3>
          Aucune histoire trouvée
        </h3>

        <p>
          Essaie de modifier ta recherche
          ou tes filtres.
        </p>
      </div>
    `;

    return;
  }


  /* Affichage */

  list.innerHTML = stories.map(story => {

    const categoryName =
      story.categories?.name ||
      "Sans genre";

    const categoryIcon =
      story.categories?.icon ||
      "📖";

    const chapterCount =
      story.chapters?.length || 0;

    const cover =
      story.cover_url;


    const coverHtml =
      isImageUrl(cover)

        ? `
          <img
            src="${escapeHtml(cover)}"
            alt="Couverture de ${escapeHtml(story.title)}"
            style="
              width:100%;
              height:220px;
              object-fit:cover;
              border-radius:12px;
              display:block;
            "
          >
        `

        : `
          <div
            style="
              width:100%;
              height:220px;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:70px;
              background:#f3f3f3;
              border-radius:12px;
            "
          >
            ${escapeHtml(
              cover || categoryIcon
            )}
          </div>
        `;


    const statusHtml =
      story.status === "published"

        ? `
          <span
            style="
              display:inline-block;
              padding:5px 10px;
              border-radius:20px;
              background:#e8f8ed;
              color:#16833b;
              font-size:13px;
              font-weight:600;
            "
          >
            🟢 Publiée
          </span>
        `

        : `
          <span
            style="
              display:inline-block;
              padding:5px 10px;
              border-radius:20px;
              background:#fff4df;
              color:#a66a00;
              font-size:13px;
              font-weight:600;
            "
          >
            📝 Brouillon
          </span>
        `;


    const toggleText =
      story.status === "published"
        ? "📝 Brouillon"
        : "🟢 Publier";


    return `
      <article
        class="story-admin-card"
        style="
          border:1px solid #e5e5e5;
          border-radius:16px;
          padding:15px;
          margin-bottom:18px;
          background:#fff;
        "
      >

        <!-- COUVERTURE -->

        ${coverHtml}


        <!-- INFORMATIONS -->

        <div style="margin-top:15px;">

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:10px;
              flex-wrap:wrap;
              margin-bottom:8px;
            "
          >

            <span
              style="
                font-size:14px;
                color:#666;
              "
            >
              ${escapeHtml(categoryIcon)}
              ${escapeHtml(categoryName)}
            </span>

            ${statusHtml}

          </div>


          <h3
            style="
              margin:8px 0;
              font-size:20px;
            "
          >
            ${escapeHtml(story.title)}
          </h3>


          <p
            style="
              color:#666;
              line-height:1.5;
              margin:8px 0;
            "
          >
            ${escapeHtml(
              story.description || "Aucune description."
            )}
          </p>


          <div
            style="
              display:flex;
              gap:12px;
              flex-wrap:wrap;
              margin:12px 0;
              font-size:14px;
              color:#666;
            "
          >

            <span>
              📚
              ${chapterCount}
              chapitre${chapterCount > 1 ? "s" : ""}
            </span>

            <span>
              👤
              ${escapeHtml(
                story.author || "Adiza Story"
              )}
            </span>

          </div>


          <!-- ACTIONS -->

          <div
            style="
              display:flex;
              gap:8px;
              flex-wrap:wrap;
              margin-top:15px;
            "
          >

            <button
              type="button"
              class="small-btn"
              onclick="editStory('${story.id}')"
            >
              ✏️ Modifier
            </button>


            <button
              type="button"
              class="small-btn"
              onclick="toggleStoryStatus(
                '${story.id}',
                '${story.status}'
              )"
            >
              ${toggleText}
            </button>


            <button
              type="button"
              class="small-btn"
              onclick="deleteStory('${story.id}')"
            >
              🗑️ Supprimer
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");
}


/* =========================================================
   FILTRER LES HISTOIRES
   ========================================================= */

function applyStoryFilters() {

  const searchInput =
    document.getElementById("searchStories");

  const statusFilter =
    document.getElementById("statusFilter");

  const genreFilter =
    document.getElementById("genreFilter");


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const selectedStatus =
    statusFilter
      ? statusFilter.value
      : "all";


  const selectedGenre =
    genreFilter
      ? genreFilter.value
      : "all";


  const filteredStories =
    allAdminStories.filter(story => {

      /* Recherche */

      const title =
        (story.title || "")
          .toLowerCase();

      const description =
        (story.description || "")
          .toLowerCase();


      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search);


      /* Statut */

      const matchesStatus =
        selectedStatus === "all" ||
        story.status === selectedStatus;


      /* Genre */

      const genre =
        story.categories?.name ||
        "";


      const matchesGenre =
        selectedGenre === "all" ||
        genre === selectedGenre;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesGenre
      );

    });


  renderStories(filteredStories);
}


/* =========================================================
   CHARGER LE DASHBOARD
   ========================================================= */

async function renderAdmin() {

  const list =
    document.getElementById("list");


  if (list) {
    list.innerHTML = `
      <div style="
        text-align:center;
        padding:30px;
      ">
        ⏳ Chargement des histoires...
      </div>
    `;
  }


  try {

    const stories =
      await getStoriesFromSupabase();


    /* Sauvegarde globale */

    allAdminStories =
      stories;


    /* Statistiques */

    updateAdminStats(
      allAdminStories
    );


    /* Affichage + filtres */

    applyStoryFilters();

  } catch (error) {

    console.error(error);


    if (list) {
      list.innerHTML = `
        <div
          style="
            text-align:center;
            padding:30px;
            color:#c62828;
          "
        >
          ❌ Impossible de charger
          les histoires.
          <br><br>
          Vérifie ta connexion
          à Supabase.
        </div>
      `;
    }

  }
}


/* =========================================================
   CRÉER UNE HISTOIRE
   ========================================================= */

/* =========================================================
   CRÉER UNE HISTOIRE
   ========================================================= */

async function createStory(event) {

  if (event) {
    event.preventDefault();
  }


  /* =====================================================
     INFORMATIONS
     ===================================================== */

  const title =
    document
      .getElementById("title")
      .value
      .trim();


  const genre =
    document
      .getElementById("genre")
      .value;


  const status =
    document
      .getElementById("status")
      .value;


  const description =
    document
      .getElementById("description")
      .value
      .trim();


  const coverFile =
    document
      .getElementById("coverFile")
      ?.files?.[0];


  /* =====================================================
     VÉRIFICATIONS
     ===================================================== */

  if (!title) {

    alert(
      "⚠️ Le titre est obligatoire."
    );

    return;
  }


  if (!genre) {

    alert(
      "⚠️ Choisis un genre."
    );

    return;
  }


  if (!status) {

    alert(
      "⚠️ Choisis un statut."
    );

    return;
  }


  if (!description) {

    alert(
      "⚠️ La description est obligatoire."
    );

    return;
  }


  /* =====================================================
     RÉCUPÉRER LES CHAPITRES
     ===================================================== */

  const chapters = [];


  const chapterBlocks =
    document.querySelectorAll(
      ".chapter-editor"
    );


  chapterBlocks.forEach(
    (chapter, index) => {

      const titleInput =
        chapter.querySelector(
          ".chapter-title"
        );


      const contentInput =
        chapter.querySelector(
          ".chapter-content"
        );


      if (
        !titleInput ||
        !contentInput
      ) {
        return;
      }


      const chapterTitle =
        titleInput.value.trim();


      const chapterContent =
        contentInput.value.trim();


      if (
        !chapterTitle ||
        !chapterContent
      ) {
        return;
      }


      chapters.push({

        title:
          chapterTitle,

        content:
          chapterContent,

        chapter_number:
          index + 1

      });

    }
  );


  /* =====================================================
     VÉRIFIER LES CHAPITRES
     ===================================================== */

  if (!chapters.length) {

    alert(
      "⚠️ Ajoute au moins un chapitre et remplis son titre et son contenu."
    );

    return;
  }


  /* =====================================================
     BOUTON DE SOUMISSION
     ===================================================== */

  const submitButton =
    document.querySelector(
      "#storyForm button[type='submit']"
    );


  const originalButtonText =
    submitButton
      ? submitButton.innerHTML
      : "";


  if (submitButton) {

    submitButton.disabled = true;

    submitButton.innerHTML =
      "⏳ Enregistrement...";

  }


  try {

    /* =================================================
       COUVERTURE
       ================================================= */

    let coverUrl =
      document
        .getElementById("cover")
        ?.value
        ?.trim() || null;


    if (coverFile) {

      if (
        !coverFile.type.startsWith(
          "image/"
        )
      ) {

        throw new Error(
          "Le fichier de couverture doit être une image."
        );

      }


      if (
        coverFile.size >
        5 * 1024 * 1024
      ) {

        throw new Error(
          "La couverture ne doit pas dépasser 5 Mo."
        );

      }


      const extension =
        coverFile.name
          .split(".")
          .pop()
          .toLowerCase();


      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}.${extension}`;


      const filePath =
        `stories/${fileName}`;


      const {
        error: uploadError
      } =
        await supabaseClient
          .storage
          .from("covers")
          .upload(
            filePath,
            coverFile,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      if (uploadError) {

        console.error(
          "Erreur upload couverture :",
          uploadError
        );

        throw new Error(
          "Impossible d'envoyer la couverture."
        );

      }


      const {
        data: publicUrlData
      } =
        supabaseClient
          .storage
          .from("covers")
          .getPublicUrl(
            filePath
          );


      coverUrl =
        publicUrlData.publicUrl;

    }


    /* =================================================
       RÉCUPÉRER LA CATÉGORIE
       ================================================= */

    const {
      data: category,
      error: categoryError
    } =
      await supabaseClient
        .from("categories")
        .select(
          "id, name, icon"
        )
        .eq(
          "name",
          genre
        )
        .single();


    if (categoryError) {

      console.error(
        "Erreur catégorie :",
        categoryError
      );

      throw new Error(
        "Genre introuvable dans Supabase."
      );

    }


    /* =================================================
       CRÉER LE SLUG
       ================================================= */

    const slug =
      createSlug(title) +
      "-" +
      Date.now();


    /* =================================================
       CRÉER L'HISTOIRE
       ================================================= */

    const {
      data: story,
      error: storyError
    } =
      await supabaseClient
        .from("stories")
        .insert([
          {
            title,

            slug,

            description,

            cover_url:
              coverUrl,

            genre_id:
              category.id,

            author:
              "Adiza Story",

            status
          }
        ])
        .select()
        .single();


    if (storyError) {

      console.error(
        "Erreur création histoire :",
        storyError
      );

      throw new Error(
        storyError.message
      );

    }


    /* =================================================
       CRÉER LES CHAPITRES
       ================================================= */

    const chaptersToInsert =
      chapters.map(
        chapter => ({

          story_id:
            story.id,

          title:
            chapter.title,

          content:
            chapter.content,

          chapter_number:
            chapter.chapter_number

        })
      );


    const {
      error: chaptersError
    } =
      await supabaseClient
        .from("chapters")
        .insert(
          chaptersToInsert
        );


    if (chaptersError) {

      console.error(
        "Erreur chapitres :",
        chaptersError
      );

      throw new Error(
        chaptersError.message
      );

    }


    /* =================================================
       SUCCÈS
       ================================================= */

    if (
      status === "published"
    ) {

      alert(
        `🎉 Histoire publiée avec ${chapters.length} chapitre(s) !`
      );

    } else {

      alert(
        `📝 Brouillon enregistré avec ${chapters.length} chapitre(s) !`
      );

    }


    /* =================================================
       RETOUR AU DASHBOARD
       ================================================= */

    window.location.href =
      "dashboard.html";


  } catch (error) {

    console.error(
      "Erreur createStory :",
      error
    );


    alert(
      `❌ Erreur : ${error.message}`
    );


    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.innerHTML =
        originalButtonText;

    }

  }

}


/* =========================================================
   SUPPRIMER UNE HISTOIRE
   ========================================================= */

async function deleteStory(storyId) {

  const confirmed =
    confirm(
      "⚠️ Es-tu sûr de vouloir supprimer cette histoire ?\n\n" +
      "Cette action supprimera également :\n" +
      "• tous les chapitres\n" +
      "• la couverture\n" +
      "• l'histoire"
    );

  if (!confirmed) {
    return;
  }


  try {

    /* =====================================================
       1. RÉCUPÉRER LA COUVERTURE
       ===================================================== */

    const {
      data: story,
      error: storyFetchError
    } = await supabaseClient
      .from("stories")
      .select("id, title, cover_url")
      .eq("id", storyId)
      .single();


    if (storyFetchError) {
      console.error(
        "Erreur récupération histoire :",
        storyFetchError
      );

      throw storyFetchError;
    }


    /* =====================================================
       2. SUPPRIMER LA COUVERTURE
       ===================================================== */

    if (
      story.cover_url &&
      story.cover_url.includes("/storage/v1/object/public/covers/")
    ) {

      try {

        /*
         * Exemple d'URL :
         *
         * https://xxxxx.supabase.co/storage/v1/object/public/covers/stories/image.jpg
         *
         * On récupère seulement :
         *
         * stories/image.jpg
         */

        const marker =
          "/storage/v1/object/public/covers/";

        const coverPath =
          decodeURIComponent(
            story.cover_url.split(marker)[1]
          );


        if (coverPath) {

          const {
            error: storageError
          } = await supabaseClient
            .storage
            .from("covers")
            .remove([
              coverPath
            ]);


          if (storageError) {

            console.warn(
              "⚠️ Impossible de supprimer la couverture :",
              storageError
            );

            /*
             * On continue quand même.
             * L'histoire pourra être supprimée.
             */

          } else {

            console.log(
              "🗑️ Couverture supprimée :",
              coverPath
            );

          }

        }

      } catch (coverError) {

        console.warn(
          "⚠️ Erreur lors du nettoyage de la couverture :",
          coverError
        );

      }

    }


    /* =====================================================
       3. SUPPRIMER LES CHAPITRES
       ===================================================== */

    const {
      error: chaptersError
    } = await supabaseClient
      .from("chapters")
      .delete()
      .eq(
        "story_id",
        storyId
      );


    if (chaptersError) {

      console.error(
        "Erreur suppression chapitres :",
        chaptersError
      );

      throw chaptersError;
    }


    /* =====================================================
       4. SUPPRIMER L'HISTOIRE
       ===================================================== */

    const {
      error: storyDeleteError
    } = await supabaseClient
      .from("stories")
      .delete()
      .eq(
        "id",
        storyId
      );


    if (storyDeleteError) {

      console.error(
        "Erreur suppression histoire :",
        storyDeleteError
      );

      throw storyDeleteError;
    }


    /* =====================================================
       5. SUCCÈS
       ===================================================== */

    alert(
      "🗑️ Histoire, chapitres et couverture supprimés avec succès !"
    );


    /* Recharger le dashboard */

    await renderAdmin();


  } catch (error) {

    console.error(
      "Erreur suppression complète :",
      error
    );


    alert(
      `❌ Impossible de supprimer complètement l'histoire.\n\n${error.message}`
    );

  }

}


/* =========================================================
   MODIFIER UNE HISTOIRE
   ========================================================= */

function editStory(storyId) {

  if (!storyId) {
    return;
  }


  window.location.href =
    `modifier-histoire.html?id=${encodeURIComponent(
      storyId
    )}`;

}


/* =========================================================
   PUBLIER / PASSER EN BROUILLON
   ========================================================= */

async function toggleStoryStatus(
  storyId,
  currentStatus
) {

  const newStatus =
    currentStatus === "published"
      ? "draft"
      : "published";


  const actionText =
    newStatus === "published"
      ? "publier"
      : "passer en brouillon";


  const confirmed =
    confirm(
      `Veux-tu vraiment ${actionText} cette histoire ?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("stories")
        .update({
          status: newStatus
        })
        .eq(
          "id",
          storyId
        );


    if (error) {

      console.error(
        "Erreur changement statut :",
        error
      );

      throw error;

    }


    if (newStatus === "published") {

      alert(
        "🟢 Histoire publiée avec succès !"
      );

    } else {

      alert(
        "📝 Histoire passée en brouillon."
      );

    }


    /* Recharger le dashboard */

    await renderAdmin();


  } catch (error) {

    console.error(
      error
    );


    alert(
      `❌ Impossible de modifier le statut.\n\n${error.message}`
    );

  }

}


/* =========================================================
   DÉCONNEXION ADMIN
   ========================================================= */

async function logoutAdmin() {

  const confirmed =
    confirm(
      "🚪 Veux-tu vraiment te déconnecter ?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .auth
        .signOut();


    if (error) {

      console.error(
        "Erreur déconnexion :",
        error
      );

      throw error;

    }


    window.location.href =
      "login.html";


  } catch (error) {

    console.error(
      error
    );


    alert(
      "❌ Impossible de se déconnecter."
    );

  }

}


/* =========================================================
   VÉRIFIER LA SESSION ADMIN
   ========================================================= */

async function checkAdminSession() {

  try {

    const {
      data: {
        session
      }
    } =
      await supabaseClient
        .auth
        .getSession();


    if (!session) {

      window.location.href =
        "login.html";

      return false;
    }


    /* Vérifier le profil */

    const {
      data: profile,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("id, role")
        .eq(
          "id",
          session.user.id
        )
        .single();


    if (error) {

      console.error(
        "Erreur profil :",
        error
      );

      await supabaseClient
        .auth
        .signOut();

      window.location.href =
        "login.html";

      return false;
    }


    if (
      !profile ||
      profile.role !== "admin"
    ) {

      alert(
        "⛔ Accès réservé aux administrateurs."
      );


      await supabaseClient
        .auth
        .signOut();


      window.location.href =
        "login.html";


      return false;
    }


    return true;


  } catch (error) {

    console.error(
      "Erreur vérification session :",
      error
    );


    window.location.href =
      "login.html";


    return false;

  }

}


/* =========================================================
   ÉVÉNEMENTS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /* -----------------------------------------------------
       FILTRES DU DASHBOARD
       ----------------------------------------------------- */

    const searchInput =
      document.getElementById(
        "searchStories"
      );


    const statusFilter =
      document.getElementById(
        "statusFilter"
      );


    const genreFilter =
      document.getElementById(
        "genreFilter"
      );


    if (searchInput) {

      searchInput.addEventListener(
        "input",
        applyStoryFilters
      );

    }


    if (statusFilter) {

      statusFilter.addEventListener(
        "change",
        applyStoryFilters
      );

    }


    if (genreFilter) {

      genreFilter.addEventListener(
        "change",
        applyStoryFilters
      );

    }


    /* -----------------------------------------------------
       FORMULAIRE DE CRÉATION
       ----------------------------------------------------- */

    const storyForm =
      document.getElementById(
        "storyForm"
      );


    if (storyForm) {

      storyForm.addEventListener(
        "submit",
        createStory
      );

    }


    /* -----------------------------------------------------
       VÉRIFICATION ADMIN
       ----------------------------------------------------- */

    const isAdmin =
      await checkAdminSession();


    if (!isAdmin) {
      return;
    }


    /* -----------------------------------------------------
       DASHBOARD
       ----------------------------------------------------- */

    if (
      document.getElementById(
        "list"
      )
    ) {

      await renderAdmin();

    }

  }
);