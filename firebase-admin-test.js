import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// ==========================================
// CONFIGURATION FIREBASE
// ==========================================

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// ==========================================
// ÉLÉMENTS DE LA PAGE
// ==========================================

const connexion =
  document.getElementById("connexion");

const administration =
  document.getElementById("administration");

const loginError =
  document.getElementById("loginError");

const registre =
  document.getElementById("registre");


// ==========================================
// CONNEXION
// ==========================================

document
  .getElementById("loginButton")
  .addEventListener("click", async () => {

    loginError.textContent = "";

    const email =
      document.getElementById("adminEmail")
        .value.trim();

    const password =
      document.getElementById("adminPassword")
        .value;

    if (!email || !password) {
      loginError.textContent =
        "Veuillez entrer votre courriel et votre mot de passe.";
      return;
    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

 } catch (error) {

  console.error("ERREUR FIREBASE :", error);

  loginError.textContent =
    "Erreur : " + error.code + " — " + error.message;
}
  });


// ==========================================
// DÉCONNEXION
// ==========================================

document
  .getElementById("logoutButton")
  .addEventListener("click", async () => {

    await signOut(auth);
  });


// ==========================================
// ÉTAT DE CONNEXION
// ==========================================

onAuthStateChanged(auth, async user => {

  if (user) {

    connexion.style.display = "none";
    administration.style.display = "block";

    registre.innerHTML =
      "<p>Chargement du registre...</p>";

    await chargerRegistre();

  } else {

    administration.style.display = "none";
    connexion.style.display = "block";

    registre.innerHTML = "";
  }
});


// ==========================================
// CHARGER LE REGISTRE
// ==========================================

async function chargerRegistre() {

  try {

    const q = query(
      collection(db, "consentements"),
      orderBy("date_signature", "desc")
    );

    const resultat = await getDocs(q);

    let html = `
      <hr>

      <h2>Registre des consentements</h2>

      <p>
        Nombre de signatures :
        <strong>${resultat.size}</strong>
      </p>
    `;

    let numero = 0;

    resultat.forEach(document => {

      numero++;

      const consentement = document.data();

      let dateFormatee = "";

      if (
        consentement.date_signature &&
        consentement.date_signature.toDate
      ) {

        dateFormatee =
          consentement.date_signature
            .toDate()
            .toLocaleString("fr-CA");
      }

      html += `
        <section class="registre-entry">

          <h2>
            ${numero}.
            ${echapper(consentement.prenom)}
            ${echapper(consentement.nom)}
          </h2>

          <p>
            <strong>Date de signature :</strong>
            ${echapper(dateFormatee)}
          </p>

          <p>
            <strong>Version du formulaire :</strong>
            ${echapper(
              consentement.version_formulaire
            )}
          </p>

          <p>
            <strong>Règles acceptées :</strong>
            ${
              consentement.regles_acceptees
                ? "Oui"
                : "Non"
            }
          </p>

          <p>
            <strong>Risques reconnus :</strong>
            ${
              consentement.risques_reconnus
                ? "Oui"
                : "Non"
            }
          </p>

          ${
            consentement.courriel
              ? `
                <p>
                  <strong>Courriel :</strong>
                  ${echapper(consentement.courriel)}
                </p>
              `
              : ""
          }

          ${
            consentement.telephone
              ? `
                <p>
                  <strong>Téléphone :</strong>
                  ${echapper(consentement.telephone)}
                </p>
              `
              : ""
          }

          <p><strong>Signature :</strong></p>

          <img
            src="${consentement.signature}"
            alt="Signature"
            style="
              display:block;
              max-width:400px;
              width:100%;
              height:auto;
              border:1px solid #ccc;
              background:white;
              margin-bottom:25px;
            "
          >

          <hr>

        </section>
      `;
    });

    registre.innerHTML = html;

  } catch (error) {

    console.error("Erreur Firestore :", error);

    registre.innerHTML = `
      <p class="error">
        Impossible de charger le registre.
      </p>
    `;
  }
}


// ==========================================
// IMPRESSION
// ==========================================

document
  .getElementById("printButton")
  .addEventListener("click", () => {

    window.print();
  });


// ==========================================
// PROTECTION DU HTML
// ==========================================

function echapper(valeur) {

  if (
    valeur === null ||
    valeur === undefined
  ) {
    return "";
  }

  return String(valeur)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
