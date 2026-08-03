"use client";
import { useState } from "react";

const resources = [
  [
    "JUR",
    "Cour de cassation — rupture abusive d’un contrat de distribution",
    "Contentieux commercial",
    "Arrêt n° 418/2026 • 18 juin 2026",
    "Validé",
    "12 citations",
  ],
  [
    "MOD",
    "Conclusions en réponse — contentieux commercial",
    "Modèle d’acte",
    "Version 4.2 • Comité contentieux",
    "Officiel",
    "34 utilisations",
  ],
  [
    "NOTE",
    "Clause de changement de contrôle en droit marocain",
    "Corporate / M&A",
    "Note interne • Y. Amrani",
    "Relue",
    "8 dossiers",
  ],
  [
    "CHK",
    "Checklist d’acquisition — due diligence juridique",
    "Corporate / M&A",
    "Version 3.1 • 42 contrôles",
    "Officiel",
    "21 utilisations",
  ],
  [
    "JUR",
    "Cour d’appel — pénalités contractuelles et force majeure",
    "Contrats",
    "Arrêt du 4 mai 2026 • Casablanca",
    "Validé",
    "7 citations",
  ],
] as const;

export function KnowledgeManagement({
  notify,
}: {
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("Bibliothèque"),
    [modal, setModal] = useState(false),
    [query, setQuery] = useState("");
  const shown = resources.filter((x) =>
    x.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="knowledge-management">
      <div className="knowledge-tabs">
        {["Bibliothèque", "Modèles", "Veille", "Expertise"].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
            {x === "Veille" && <em>5</em>}
          </button>
        ))}
      </div>
      <div className="knowledge-kpis">
        {[
          ["Ressources validées", "486", "+18 ce mois"],
          ["Modèles officiels", "74", "9 domaines"],
          ["Veilles à traiter", "5", "2 prioritaires"],
          ["Contributions", "32", "Ce trimestre"],
          ["Taux de réutilisation", "68 %", "+7 pts en 6 mois"],
        ].map((x, i) => (
          <article className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 2 ? "warn" : i === 4 ? "good" : ""}>
              {x[2]}
            </small>
          </article>
        ))}
      </div>
      {tab === "Bibliothèque" && (
        <>
          <div className="panel knowledge-search">
            <div>
              <h2>Base de connaissances du cabinet</h2>
              <p>
                Contenus qualifiés, versionnés et accessibles selon les
                habilitations.
              </p>
            </div>
            <label>
              <span>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une jurisprudence, un modèle, une note…"
              />
            </label>
            <button
              className="secondary"
              onClick={() => notify("Filtres Domaine & type ouverts")}
            >
              ⌁ Domaine & type
            </button>
            <button className="primary" onClick={() => setModal(true)}>
              ＋ Contribuer
            </button>
          </div>
          <div className="knowledge-layout">
            <section className="panel resource-list">
              <div className="resource-row header">
                <span>Ressource</span>
                <span>Domaine</span>
                <span>Référence</span>
                <span>Statut</span>
                <span>Usage</span>
                <span />
              </div>
              {shown.map((x, i) => (
                <button
                  className="resource-row"
                  key={x[1]}
                  onClick={() => notify("Ressource et historique ouverts")}
                >
                  <i className={`resource-type r${i}`}>{x[0]}</i>
                  <span>
                    <b>{x[1]}</b>
                    <small>{x[2]}</small>
                  </span>
                  <span>{x[3]}</span>
                  <em className={`resource-status rs${i}`}>{x[4]}</em>
                  <strong>{x[5]}</strong>
                  <i>›</i>
                </button>
              ))}
            </section>
            <aside>
              <div className="panel popular-card">
                <span>LES PLUS RÉUTILISÉS</span>
                {[
                  ["Conclusions commerciales", "34"],
                  ["Checklist due diligence", "21"],
                  ["Convention d’honoraires", "18"],
                  ["Clause de confidentialité", "15"],
                ].map((x, i) => (
                  <div key={x[0]}>
                    <i>{i + 1}</i>
                    <b>{x[0]}</b>
                    <strong>{x[1]}</strong>
                  </div>
                ))}
              </div>
              <div className="panel quality-card">
                <span>QUALITÉ DU SAVOIR</span>
                <strong>92%</strong>
                <p>448 ressources revues dans les 12 derniers mois.</p>
                <button onClick={() => notify("Plan de revue ouvert")}>
                  Voir les revues à planifier
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
      {tab === "Modèles" && (
        <div className="template-grid">
          {[
            ["DOC", "Conclusions & mémoires", "18 modèles", "Contentieux"],
            ["CTR", "Contrats commerciaux", "14 modèles", "Contrats"],
            ["M&A", "Corporate & opérations", "16 modèles", "Corporate"],
            ["HR", "Droit social", "11 modèles", "Social"],
            ["REC", "Recouvrement", "9 modèles", "Contentieux"],
            ["ADM", "Courriers administratifs", "6 modèles", "Cabinet"],
          ].map((x, i) => (
            <article className="panel template-card" key={x[1]}>
              <div>
                <i className={`tc${i}`}>{x[0]}</i>
                <button onClick={() => notify("Options du modèle ouvertes")}>
                  •••
                </button>
              </div>
              <h3>{x[1]}</h3>
              <p>
                {x[2]} • {x[3]}
              </p>
              <footer>
                <span>Revue : juillet 2026</span>
                <button onClick={() => notify("Collection de modèles ouverte")}>
                  Ouvrir ›
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
      {tab === "Veille" && (
        <div className="watch-layout">
          <section className="panel watch-list">
            <div className="knowledge-title">
              <div>
                <h2>Veille juridique à qualifier</h2>
                <p>
                  Nouveautés réglementaires et décisions avant diffusion
                  interne.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => notify("Sélecteur des sources ouvert")}
              >
                Toutes les sources
              </button>
            </div>
            {[
              [
                "Prioritaire",
                "Projet de réforme de la procédure civile",
                "Bulletin officiel • 31 juillet 2026",
                "Impact à analyser sur les échéances et voies de recours",
              ],
              [
                "Nouveau",
                "Décision de la Cour de cassation — distribution exclusive",
                "Jurisprudence • 30 juillet 2026",
                "À rapprocher de 4 dossiers actifs",
              ],
              [
                "Nouveau",
                "Note de l’AMMC sur les obligations d’information",
                "Réglementaire • 29 juillet 2026",
                "Pertinent pour Corporate / M&A",
              ],
              [
                "À revoir",
                "Mise à jour du barème des frais judiciaires",
                "Bulletin officiel • 28 juillet 2026",
                "Mettre à jour les budgets types",
              ],
            ].map((x, i) => (
              <article className="watch-item" key={x[1]}>
                <i className={`watch-tone w${i}`}>{x[0]}</i>
                <div>
                  <h3>{x[1]}</h3>
                  <span>{x[2]}</span>
                  <p>{x[3]}</p>
                </div>
                <button
                  className="secondary"
                  onClick={() => notify("Analyse de veille ouverte")}
                >
                  Qualifier
                </button>
              </article>
            ))}
          </section>
          <aside className="panel watch-sources">
            <span>SOURCES SUIVIES</span>
            {[
              ["Bulletin officiel", "Actif"],
              ["Cour de cassation", "Actif"],
              ["AMMC", "Actif"],
              ["Conseil de la concurrence", "Actif"],
              ["DGI / fiscalité", "Actif"],
            ].map((x) => (
              <div key={x[0]}>
                <b>{x[0]}</b>
                <i>{x[1]}</i>
              </div>
            ))}
            <button onClick={() => notify("Sources de veille ouvertes")}>
              Gérer les sources
            </button>
          </aside>
        </div>
      )}
      {tab === "Expertise" && (
        <div className="expertise-layout">
          <section className="panel">
            <div className="knowledge-title">
              <div>
                <h2>Cartographie de l’expertise</h2>
                <p>
                  Compétences déclarées, contributions et expériences dossier.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => notify("Cartographie des 9 domaines ouverte")}
              >
                9 domaines
              </button>
            </div>
            {[
              [
                "SB",
                "Sara Benali",
                "Contentieux commercial",
                "Experte",
                "42 dossiers • 28 contributions",
                92,
              ],
              [
                "NE",
                "Nadia El Idrissi",
                "Procédure & arbitrage",
                "Référente",
                "37 dossiers • 21 contributions",
                86,
              ],
              [
                "YA",
                "Youssef Amrani",
                "Corporate / M&A",
                "Expert",
                "31 dossiers • 18 contributions",
                88,
              ],
              [
                "MA",
                "Meryem Alaoui",
                "Recouvrement",
                "Confirmée",
                "24 dossiers • 12 contributions",
                72,
              ],
            ].map((x, i) => (
              <div className="expert-row" key={x[1] as string}>
                <span className={`mini-avatar a${i}`}>{x[0]}</span>
                <span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </span>
                <i>{x[3]}</i>
                <span>
                  <small>{x[4]}</small>
                  <div>
                    <em style={{ width: `${x[5]}%` }} />
                  </div>
                </span>
                <button onClick={() => notify("Profil d’expertise ouvert")}>
                  ›
                </button>
              </div>
            ))}
          </section>
          <aside className="panel expertise-gap">
            <span>BESOIN DE RENFORCEMENT</span>
            <h3>Protection des données</h3>
            <p>3 nouveaux dossiers, mais une seule personne référente.</p>
            <div>
              <b>Actions suggérées</b>
              <small>Formation ciblée</small>
              <small>Revue par un expert externe</small>
              <small>Création d’un parcours de savoir</small>
            </div>
            <button onClick={() => notify("Plan de développement ouvert")}>
              Créer un plan
            </button>
          </aside>
        </div>
      )}
      {modal && (
        <ContributionModal close={() => setModal(false)} notify={notify} />
      )}
    </div>
  );
}
function ContributionModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal contribution-modal">
        <div className="modal-head">
          <div>
            <span>CAPITALISATION</span>
            <h2>Proposer une ressource</h2>
            <p>
              La publication nécessite une revue par le référent du domaine.
            </p>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="contribution-form">
          <label className="wide">
            Titre
            <input placeholder="Titre clair et réutilisable" />
          </label>
          <label>
            Type
            <select>
              <option>Note interne</option>
              <option>Jurisprudence commentée</option>
              <option>Modèle d’acte</option>
              <option>Checklist</option>
            </select>
          </label>
          <label>
            Domaine
            <select>
              <option>Contentieux commercial</option>
              <option>Corporate / M&A</option>
              <option>Droit social</option>
              <option>Recouvrement</option>
            </select>
          </label>
          <label className="wide">
            Résumé
            <textarea placeholder="Apport, contexte d’utilisation et points de vigilance…" />
          </label>
          <label>
            Dossier source
            <select>
              <option>IL-2026-0091 • Société Atlas</option>
              <option>IL-2026-0064 • Horizon Capital</option>
              <option>Aucun dossier</option>
            </select>
          </label>
          <label>
            Relecteur
            <select>
              <option>Nadia El Idrissi</option>
              <option>Sara Benali</option>
              <option>Youssef Amrani</option>
            </select>
          </label>
          <label className="wide consent">
            <input type="checkbox" /> La ressource a été nettoyée de toute
            donnée client confidentielle
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            Brouillon
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Ressource soumise à la revue du référent");
              close();
            }}
          >
            Soumettre à validation
          </button>
        </div>
      </div>
    </div>
  );
}
