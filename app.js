const SUPABASE_URL = "https://kisycpyatanclcaytnav.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_mvGAnjexhythAXvbL9PoLg_BzJHwSyK";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const screens = [...document.querySelectorAll(".screen")];

let step = 1;
let drawing = false;
let hasSignature = false;
let submitting = false;

const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");

function showStep(n) {
  step = n;

  screens.forEach(screen => {
    screen.classList.toggle(
      "active",
      Number(screen.dataset.step) === n
    );
  });

  document.getElementById("progressText").textContent = `${n} / 6`;

  if (n === 4) {
    resizeCanvas();
  }

  window.scrollTo(0, 0);
}

function clearErrors() {
  document.querySelectorAll(".error").forEach(element => {
    element.textContent = "";
  });
}

function validStep(n) {
  clearErrors();

  if (n === 2) {
    const prenom = document.getElementById("prenom").value.trim();
    const nom = document.getElementById("nom").value.trim();

    if (!prenom || !nom) {
      document.getElementById("identityError").textContent =
        "Veuillez remplir le prénom et le nom.";
      return false;
    }
  }

  if (n === 3) {
    const regles = document.getElementById("regles").checked;
    const risques = document.getElementById("risques").checked;

    if (!regles || !risques) {
      document.getElementById("rulesError").textContent =
        "Veuillez cocher les deux cases.";
      return false;
    }
  }

  if (n === 4 && !hasSignature) {
    document.getElementById("signatureError").textContent =
      "Veuillez signer avant de continuer.";
    return false;
  }

  if (n === 5 && !document.getElementById("finalAccept").checked) {
    document.getElementById("finalError").textContent =
      "Veuillez confirmer votre inscription.";
    return false;
  }

  return true;
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", async () => {

    if (!validStep(step)) return;

    if (step === 5) {
      await enregistrerInscription();
      return;
    }

    showStep(Math.min(6, step + 1));
  });
});

document.querySelectorAll("[data-prev]").forEach(button => {
  button.addEventListener("click", () => {
    showStep(Math.max(1, step - 1));
  });
});

function resizeCanvas() {
  if (hasSignature) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

canvas.addEventListener("pointerdown", event => {
  drawing = true;

  canvas.setPointerCapture(event.pointerId);

  const point = pointerPosition(event);

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
});

canvas.addEventListener("pointermove", event => {
  if (!drawing) return;

  const point = pointerPosition(event);

  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  hasSignature = true;
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

canvas.addEventListener("pointercancel", () => {
  drawing = false;
});

function clearSignaturePad() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignature = false;
  clearErrors();
}

document.getElementById("clearSignature").addEventListener(
  "click",
  clearSignaturePad
);

async function enregistrerInscription() {

  if (submitting) return;

  submitting = true;

  const bouton = document.querySelector(
    '.screen[data-step="5"] .primary'
  );

  const texteOriginal = bouton.textContent;

  bouton.disabled = true;
  bouton.textContent = "ENREGISTREMENT...";

  document.getElementById("finalError").textContent = "";

  try {

    const signature = canvas.toDataURL("image/png");

    const { data, error } = await db.rpc(
      "enregistrer_inscription",
      {
        p_prenom:
          document.getElementById("prenom").value.trim(),

        p_nom:
          document.getElementById("nom").value.trim(),

        p_courriel:
          document.getElementById("courriel").value.trim(),

        p_telephone:
          document.getElementById("telephone").value.trim(),

        p_version_formulaire: "1.0",

        p_signature: signature
      }
    );

    if (error) {
      throw error;
    }

    console.log("Inscription créée :", data);

    showStep(6);

  } catch (error) {

    console.error(error);

    document.getElementById("finalError").textContent =
      "L'inscription n'a pas pu être enregistrée. Veuillez réessayer.";

  } finally {

    submitting = false;
    bouton.disabled = false;
    bouton.textContent = texteOriginal;
  }
}

document.getElementById("restart").addEventListener("click", () => {
  window.location.reload();
});
