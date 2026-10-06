// =====================================================
// ADIZA STORY — CONNEXION ADMIN SUPABASE
// =====================================================

async function loginAdmin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("message");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Veuillez remplir tous les champs.";
    message.className = "danger";
    return;
  }

  message.textContent = "Connexion...";
  message.className = "";

  // Connexion réelle avec Supabase Auth
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Erreur Supabase Auth :", error);

    message.textContent =
      "Erreur de connexion : " + error.message;

    message.className = "danger";

    return;
  }

  // Vérifier que la session existe
  if (!data.session || !data.user) {
    message.textContent =
      "La connexion n'a pas créé de session.";

    message.className = "danger";

    return;
  }

  // Vérifier le profil administrateur
  const { data: profile, error: profileError } =
    await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

  if (profileError || !profile) {
    console.error("Profil introuvable :", profileError);

    await supabaseClient.auth.signOut();

    message.textContent =
      "Ce compte n'a pas de profil administrateur.";

    message.className = "danger";

    return;
  }

  if (profile.role !== "admin") {
    await supabaseClient.auth.signOut();

    message.textContent =
      "Ce compte n'est pas administrateur.";

    message.className = "danger";

    return;
  }

  // Tout est OK
  message.textContent =
    "✅ Connexion réussie !";

  message.className = "success";

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 700);
}


// =====================================================
// INITIALISATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", loginAdmin);
  }

});