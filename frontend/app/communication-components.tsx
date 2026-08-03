"use client";
import { useState } from "react";

const threads = [
  [
    "AK",
    "Amine Karim",
    "Société Atlas • IL-2026-0091",
    "Pièces complémentaires pour l’audience",
    "Je viens de déposer les contrats demandés dans le portail.",
    "10:42",
    "2",
    "portal",
  ],
  [
    "NE",
    "Nadia El Idrissi",
    "Interne • IL-2026-0087",
    "Validation du mémoire en réponse",
    "La version 4 intègre les derniers commentaires.",
    "09:18",
    "1",
    "internal",
  ],
  [
    "HC",
    "Horizon Capital",
    "Client • IL-2026-0064",
    "Projet de transaction v3",
    "Pouvez-vous confirmer le calendrier de signature ?",
    "Hier",
    "",
    "email",
  ],
  [
    "GR",
    "Greffe — Tribunal de commerce",
    "Juridiction • IL-2026-0091",
    "Convocation audience du 1er août",
    "Convocation enregistrée et classée au dossier.",
    "Hier",
    "",
    "mail",
  ],
] as const;

export function CommunicationManagement({
  notify,
}: {
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("Boîte unifiée"),
    [selected, setSelected] = useState(0),
    [compose, setCompose] = useState(false);
  return (
    <div className="communication-management">
      <div className="communication-tabs">
        {["Boîte unifiée", "Demandes clients", "Courriers", "Modèles"].map(
          (x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
              {x === "Boîte unifiée" && <em>3</em>}
            </button>
          ),
        )}
      </div>
      <div className="communication-kpis">
        {[
          ["Messages non lus", "3", "2 clients"],
          ["Réponses attendues", "7", "3 dépassent 48 h"],
          ["Demandes ouvertes", "9", "4 prioritaires"],
          ["Courriers à valider", "4", "Avant envoi"],
          ["Délai moyen de réponse", "4 h 18", "−36 min ce mois"],
        ].map((x, i) => (
          <article className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small
              className={i === 1 || i === 3 ? "warn" : i === 4 ? "good" : ""}
            >
              {x[2]}
            </small>
          </article>
        ))}
      </div>
      {tab === "Boîte unifiée" && (
        <div className="inbox-layout">
          <aside className="panel thread-list">
            <div className="thread-tools">
              <label>
                <span>⌕</span>
                <input placeholder="Rechercher les échanges…" />
              </label>
              <button onClick={() => setCompose(true)}>＋</button>
            </div>
            <div className="thread-filters">
              {["Tous", "Non lus", "Clients", "Interne"].map((x, i) => (
                <button
                  className={i === 0 ? "active" : ""}
                  key={x}
                  onClick={() => notify(`Filtre ${x} appliqué`)}
                >
                  {x}
                </button>
              ))}
            </div>
            {threads.map((x, i) => (
              <button
                className={`thread-item ${selected === i ? "selected" : ""}`}
                key={x[1]}
                onClick={() => setSelected(i)}
              >
                <span className={`thread-avatar ta${i}`}>{x[0]}</span>
                <span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                  <strong>{x[3]}</strong>
                  <p>{x[4]}</p>
                </span>
                <time>{x[5]}</time>
                {x[6] && <em>{x[6]}</em>}
              </button>
            ))}
          </aside>
          <section className="panel conversation">
            <header>
              <div>
                <span className={`thread-avatar ta${selected}`}>
                  {threads[selected][0]}
                </span>
                <span>
                  <h2>{threads[selected][1]}</h2>
                  <p>{threads[selected][2]}</p>
                </span>
              </div>
              <div>
                <button onClick={() => notify("Appel journalisé au dossier")}>
                  ☎ Appeler
                </button>
                <button
                  onClick={() => notify("Options de conversation ouvertes")}
                >
                  •••
                </button>
              </div>
            </header>
            <div className="conversation-context">
              <span>DOSSIER LIÉ</span>
              <b>
                {selected === 0
                  ? "IL-2026-0091 • Atlas c/ Maroc Distribution"
                  : threads[selected][2]}
              </b>
              <button onClick={() => notify("Dossier 360° ouvert")}>
                Ouvrir le dossier ›
              </button>
            </div>
            <div className="messages">
              <time>AUJOURD’HUI</time>
              <article className="received">
                <span>{threads[selected][0]}</span>
                <div>
                  <p>
                    {selected === 0
                      ? "Bonjour Maître, je viens de déposer dans le portail les contrats 2024 et les échanges commerciaux demandés pour l’audience."
                      : threads[selected][4]}
                  </p>
                  <small>{threads[selected][5]} • Canal sécurisé</small>
                </div>
              </article>
              {selected === 0 && (
                <>
                  <article className="sent">
                    <div>
                      <p>
                        Merci Monsieur Karim. Nous allons vérifier les pièces et
                        vous confirmer leur prise en compte avant 14 h.
                      </p>
                      <small>10:47 • Lu</small>
                    </div>
                    <span>SB</span>
                  </article>
                  <article className="system-message">
                    ▤ 4 documents ajoutés à IL-2026-0091 • Analyse antivirus
                    terminée
                  </article>
                </>
              )}
            </div>
            <footer>
              <div>
                <button onClick={() => notify("Ajout de pièce joint ouvert")}>
                  ＋
                </button>
                <button onClick={() => notify("Sélection de modèle ouverte")}>
                  ▤
                </button>
                <textarea placeholder="Rédiger une réponse sécurisée…" />
              </div>
              <div>
                <label>
                  <input type="checkbox" defaultChecked /> Classer au dossier
                </label>
                <button
                  className="primary"
                  onClick={() => notify("Réponse envoyée, classée et tracée")}
                >
                  Envoyer ↗
                </button>
              </div>
            </footer>
          </section>
          <aside className="panel conversation-info">
            <span>PARTICIPANTS</span>
            {[
              [
                threads[selected][0],
                threads[selected][1],
                selected === 1 ? "Avocate senior" : "Contact principal",
              ],
              ["SB", "Sara Benali", "Responsable du dossier"],
            ].map((x, i) => (
              <div className="info-person" key={i}>
                <span className={`thread-avatar ta${i}`}>{x[0]}</span>
                <span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </span>
              </div>
            ))}
            <span>ENGAGEMENTS</span>
            {[
              ["Réponse promise", "Aujourd’hui • 14:00", "open"],
              ["Pièces à vérifier", "4 documents", "open"],
              ["Compte rendu client", "Après audience", "later"],
            ].map((x) => (
              <div className="commitment" key={x[0]}>
                <i className={x[2]} />
                <span>
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </span>
              </div>
            ))}
            <button onClick={() => notify("Nouvel engagement créé")}>
              ＋ Ajouter un engagement
            </button>
          </aside>
        </div>
      )}
      {tab === "Demandes clients" && (
        <section className="panel request-register">
          <div className="communication-title">
            <div>
              <h2>Demandes clients</h2>
              <p>
                Questions, pièces et décisions attendues avec responsable et
                délai.
              </p>
            </div>
            <button
              className="primary"
              onClick={() => notify("Nouvelle demande client préparée")}
            >
              ＋ Nouvelle demande
            </button>
          </div>
          <div className="request-row header">
            <span>Demande</span>
            <span>Client / dossier</span>
            <span>Responsable</span>
            <span>Échéance</span>
            <span>Statut</span>
            <span />
          </div>
          {[
            [
              "Valider le projet de transaction",
              "Horizon Capital • IL-2026-0064",
              "Y. Amrani",
              "Aujourd’hui, 18:00",
              "Réponse reçue",
            ],
            [
              "Transmettre les relevés de créances",
              "Logis Nord • IL-2026-0042",
              "M. Alaoui",
              "3 août, 12:00",
              "En attente client",
            ],
            [
              "Confirmer les bénéficiaires effectifs",
              "Groupe Andalous • IL-2026-0087",
              "N. El Idrissi",
              "3 août, 17:00",
              "Relance requise",
            ],
            [
              "Choisir l’option de règlement",
              "Société Atlas • IL-2026-0091",
              "S. Benali",
              "5 août, 10:00",
              "À envoyer",
            ],
          ].map((x, i) => (
            <button
              className="request-row"
              key={x[0]}
              onClick={() => notify("Demande et historique ouverts")}
            >
              <span>
                <b>{x[0]}</b>
                <small>
                  {i === 0 ? "Message reçu à 11:06" : "Créée le 31 juillet"}
                </small>
              </span>
              <span>{x[1]}</span>
              <span>{x[2]}</span>
              <time>{x[3]}</time>
              <i className={`request-status rq${i}`}>{x[4]}</i>
              <em>›</em>
            </button>
          ))}
        </section>
      )}
      {tab === "Courriers" && (
        <section className="panel correspondence-register">
          <div className="communication-title">
            <div>
              <h2>Registre des courriers</h2>
              <p>
                Production, validation, envoi, preuve de remise et classement.
              </p>
            </div>
            <button className="primary" onClick={() => setCompose(true)}>
              ＋ Nouveau courrier
            </button>
          </div>
          {[
            [
              "COR-2026-0184",
              "Mise en demeure — Maroc Distribution",
              "IL-2026-0091",
              "N. El Idrissi",
              "À valider",
              "Aujourd’hui",
            ],
            [
              "COR-2026-0183",
              "Transmission du projet de transaction",
              "IL-2026-0064",
              "Y. Amrani",
              "Remis",
              "31 juillet",
            ],
            [
              "COR-2026-0182",
              "Relance amiable — créances échues",
              "IL-2026-0042",
              "M. Alaoui",
              "Envoyé",
              "30 juillet",
            ],
            [
              "COR-2026-0181",
              "Demande de renvoi d’audience",
              "IL-2026-0087",
              "S. Benali",
              "Classé",
              "29 juillet",
            ],
          ].map((x, i) => (
            <article className="correspondence-row" key={x[0]}>
              <span className="letter-icon">✉</span>
              <span>
                <b>{x[1]}</b>
                <small>
                  {x[0]} • {x[2]}
                </small>
              </span>
              <span>
                <small>Auteur</small>
                <b>{x[3]}</b>
              </span>
              <i className={`letter-status ls${i}`}>{x[4]}</i>
              <time>{x[5]}</time>
              <button
                onClick={() => notify("Courrier et preuve d’envoi ouverts")}
              >
                ›
              </button>
            </article>
          ))}
        </section>
      )}
      {tab === "Modèles" && (
        <div className="message-template-grid">
          {[
            [
              "REL",
              "Relance de pièces client",
              "Portail & e-mail",
              "FR • EN • AR",
            ],
            ["CR", "Compte rendu après audience", "Portail client", "FR • AR"],
            [
              "HON",
              "Transmission d’une proposition",
              "Lien sécurisé",
              "FR • EN",
            ],
            [
              "KYC",
              "Demande de pièces KYC",
              "Portail & e-mail",
              "FR • EN • AR",
            ],
            [
              "RDV",
              "Confirmation de rendez-vous",
              "E-mail & notification",
              "FR • EN • AR",
            ],
            ["REC", "Relance de règlement", "E-mail", "FR • AR"],
          ].map((x, i) => (
            <article className="panel message-template" key={x[1]}>
              <div>
                <i className={`mt${i}`}>{x[0]}</i>
                <button onClick={() => notify("Options du modèle ouvertes")}>
                  •••
                </button>
              </div>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
              <footer>
                <span>{x[3]}</span>
                <button
                  onClick={() => notify("Modèle de communication ouvert")}
                >
                  Utiliser ›
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
      {compose && (
        <ComposeModal close={() => setCompose(false)} notify={notify} />
      )}
    </div>
  );
}
function ComposeModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal compose-modal">
        <div className="modal-head">
          <div>
            <span>COMMUNICATION</span>
            <h2>Nouveau message sécurisé</h2>
            <p>
              L’échange sera classé dans le dossier et conservé avec ses
              preuves.
            </p>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="compose-form">
          <label>
            Dossier
            <select>
              <option>IL-2026-0091 • Société Atlas</option>
              <option>IL-2026-0064 • Horizon Capital</option>
              <option>IL-2026-0042 • Logis Nord</option>
            </select>
          </label>
          <label>
            Canal
            <select>
              <option>Portail client sécurisé</option>
              <option>E-mail</option>
              <option>Courrier</option>
            </select>
          </label>
          <label className="wide">
            Destinataires
            <input defaultValue="Amine Karim • Société Atlas" />
          </label>
          <label className="wide">
            Objet
            <input placeholder="Objet de la communication" />
          </label>
          <label className="wide">
            Message
            <textarea placeholder="Rédiger votre message…" />
          </label>
          <label>
            Modèle
            <select>
              <option>Aucun modèle</option>
              <option>Demande de pièces</option>
              <option>Compte rendu après audience</option>
            </select>
          </label>
          <label>
            Validation
            <select>
              <option>Aucune validation requise</option>
              <option>Sara Benali</option>
              <option>Nadia El Idrissi</option>
            </select>
          </label>
          <label className="wide consent">
            <input type="checkbox" defaultChecked /> Classer automatiquement le
            message et les réponses dans le dossier
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            Enregistrer le brouillon
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Message sécurisé envoyé et classé");
              close();
            }}
          >
            Envoyer ↗
          </button>
        </div>
      </div>
    </div>
  );
}
