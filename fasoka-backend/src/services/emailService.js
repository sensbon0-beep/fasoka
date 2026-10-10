// Envoi d'emails via l'API HTTP de Brevo (https://www.brevo.com).
// On utilise l'API web (et non le protocole SMTP) car Railway bloque le SMTP
// sur les plans Free / Trial / Hobby.
//
// Variables d'environnement :
//   BREVO_API_KEY    clé API Brevo
//   EMAIL_FROM       adresse d'expéditeur validée dans Brevo
//   EMAIL_FROM_NAME  nom affiché (par défaut : Fasoka)
//
// Si BREVO_API_KEY ou EMAIL_FROM n'est pas défini, on passe en MODE SIMULATION :
// l'email n'est pas envoyé, son contenu (donc le code de confirmation) s'affiche
// dans les logs du serveur. Pratique pour tester avant de configurer Brevo.

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

function emailConfigure() {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

async function envoyerEmail({ to, subject, html, text }) {
  if (!emailConfigure()) {
    console.log('[EMAIL SIMULÉ] Destinataire : ' + to + ' | Objet : ' + subject + '\n' + text);
    return { simule: true };
  }

  const reponse = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_FROM_NAME || 'Fasoka', email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    throw new Error('Envoi email échoué (' + reponse.status + ') : ' + detail);
  }
  return { simule: false };
}

module.exports = { envoyerEmail, emailConfigure };
