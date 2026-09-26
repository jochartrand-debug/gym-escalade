const SUPABASE_URL = "https://kisycpyatanclcaytnav.supabase.co";
const SUPABASE_KEY = "sb_publishable_mvGAnjexhythAXvbL9PoLg_BzJHwSyK";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const connexion = document.getElementById("connexion");
const administration = document.getElementById("administration");
const loginError = document.getElementById("loginError");
const registre = document.getElementById("registre");


// --------------------
// CONNEXION
// --------------------

document.getElementById("loginButton").addEventListener(
  "click",
  async () => {

    loginError.textContent = "";

    const email =
      document.getElementById("adminEmail").value.trim();

    const password =
      document.getElementById("adminPassword").value;

    if (!email || !password) {
      loginError.textContent =
        "Veuillez entrer votre courriel et votre mot de passe.";
      return;
    }

    const { error } =
      await db.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      console.error(error);

      loginError.textContent =
        "Connexion impossible. Vérifiez votre courriel et votre mot de passe.";

      return;
    }

    await afficherAdministration();
  }
);


// --------------------
// DÉCONNEXION
// --------------------

document.getElementById("logoutButton").addEventListener(
  "click",
  async () => {

    await db.auth.signOut();

    administration.style.display = "none";
    connexion.style.display = "block";

    registre.innerHTML = "";
  }
);


// --------------------
// AFFICHER ADMIN
// --------------------

async function afficherAdministration() {

  connexion.style.display = "none";
  administration.style.display = "block";

  registre.innerHTML =
    "<p>Chargement du registre...</p>";

  await chargerRegistre();
}


// --------------------
// CHARGER LES DONNÉES
// --------------------

async function chargerRegistre() {

  const { data: participants, error: erreurParticipants } =
    await db
      .from("participants")
      .select("*");

  const { data: consentements, error: erreurConsentements } =
    await db
      .from("consentements")
      .select("*")
      .order("date_signature", { ascending: false });

  const { data: versions, error: erreurVersions } =
    await db
      .from("versions_formulaire")
      .select("*");

  if (
    erreurParticipants ||
    erreurConsentements ||
    erreurVersions
  ) {

    console.error(
      erreurParticipants,
      erreurConsentements,
      erreurVersions
    );

    registre.innerHTML =
      "<p class='error'>Impossible de charger le registre.</p>";

    return;
  }


  // --------------------
  // ASSOCIER LES DONNÉES
  // --------------------

  const participantsParId = {};

  participants.forEach(participant => {
    participantsParId[participant.id] = participant;
  });

  const versionsParNumero = {};

  versions.forEach(version => {
    versionsParNumero[version.version] = version;
  });


  // --------------------
  // CONSTRUIRE LE REGISTRE
  // --------------------

  let html = `
    <hr>

    <h2>Registre des consentements</h2>

    <p>
      Nombre de signatures :
      <strong>${consentements.length}</strong>
    </p>
  `;


  consentements.forEach((consentement, index) => {

    const participant =
      participantsParId[consentement.participant_id];

    if (!participant) return;

    const date =
      new Date(consentement.date_signature);

    const dateFormatee =
      date.toLocaleString("fr-CA");

    html += `
      <section class="registre-entry">

        <h2>
          ${index + 1}.
          ${echapper(participant.prenom)}
          ${echapper(participant.nom)}
        </h2>

        <p>
          <strong>Date de signature :</strong>
          ${echapper(dateFormatee)}
        </p>

        <p>
          <strong>Version du formulaire :</strong>
          ${echapper(consentement.version_formulaire)}
        </p>

        <p>
          <strong>Règles acceptées :</strong>
          ${consentement.regles_acceptees ? "Oui" : "Non"}
        </p>

        <p>
          <strong>Risques reconnus :</strong>
          ${consentement.risques_reconnus ? "Oui" : "Non"}
        </p>

        ${
          participant.courriel
            ? `<p><strong>Courriel :</strong>
               ${echapper(participant.courriel)}</p>`
            : ""
        }

        ${
          participant.telephone
            ? `<p><strong>Téléphone :</strong>
               ${echapper(participant.telephone)}</p>`
            : ""
        }

        <p><strong>Signature :</strong></p>

        <img
          src="${consentement.signature}"
          alt="Signature de ${echapper(participant.prenom)} ${echapper(participant.nom)}"
          style="
            max-width:400px;
            width:100%;
            height:auto;
            border:1px solid #ccc;
            background:white;
          ">

        <hr>

      </section>
    `;
  });


  // --------------------
  // ANNEXE FORMULAIRE
  // --------------------

  html += `
    <section class="formulaire-annexe">

      <h1>Annexe — Versions du formulaire</h1>
  `;

  versions.forEach(version => {

    html += `
      <h2>
        Version ${echapper(version.version)}
      </h2>

      <h3>
        ${echapper(version.titre)}
      </h3>

      <div style="white-space:pre-wrap;">
        ${echapper(version.contenu)}
      </div>

      <hr>
    `;
  });

  html += "</section>";

  registre.innerHTML = html;
}


// --------------------
// IMPRESSION
// --------------------

document.getElementById("printButton").addEventListener(
  "click",
  () => {
    window.print();
  }
);


// --------------------
// PROTECTION HTML
// --------------------

function echapper(valeur) {

  if (valeur === null || valeur === undefined) {
    return "";
  }

  return String(valeur)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// --------------------
// SESSION EXISTANTE
// --------------------

(async () => {

  const {
    data: { session }
  } = await db.auth.getSession();

  if (session) {
    await afficherAdministration();
  }

})();
