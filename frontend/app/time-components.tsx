"use client";

import { useState } from "react";

export function TimeManagement({ notify }: { notify: (x: string) => void }) {
  const [tab, setTab] = useState("Ma semaine");
  const [modal, setModal] = useState(false);
  const entries = [
    [
      "31 juil.",
      "IL-2026-0091",
      "Préparation dossier d’audience",
      "S. Benali",
      "4 h 30",
      "Facturable",
      "Validé",
    ],
    [
      "31 juil.",
      "IL-2026-0087",
      "Analyse des conclusions adverses",
      "N. El Idrissi",
      "3 h 00",
      "Facturable",
      "Validé",
    ],
    [
      "31 juil.",
      "INTERNE",
      "Réunion équipe contentieux",
      "S. Benali",
      "1 h 00",
      "Non facturable",
      "Validé",
    ],
    [
      "30 juil.",
      "IL-2026-0064",
      "Revue de la documentation M&A",
      "Y. Amrani",
      "5 h 15",
      "Facturable",
      "À valider",
    ],
    [
      "30 juil.",
      "IL-2026-0042",
      "Relance huissier et suivi client",
      "M. Alaoui",
      "2 h 30",
      "Facturable",
      "Brouillon",
    ],
  ];
  return (
    <div className="time-management">
      <div className="time-tabs">
        {["Ma semaine", "Équipe", "À valider", "Analyse"].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="time-kpis">
        {[
          ["Temps saisi", "36 h 45", "Objectif semaine : 40 h"],
          ["Facturable", "31 h 15", "Taux : 85 %"],
          ["À valider", "7 h 45", "3 saisies en attente"],
          ["Non saisi estimé", "3 h 15", "2 jours incomplets"],
          ["Valeur produite", "48 600 DH", "Selon tarifs applicables"],
        ].map((x, i) => (
          <div className="panel" key={i}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 2 || i === 3 ? "warn" : ""}>{x[2]}</small>
          </div>
        ))}
      </div>
      {tab === "Ma semaine" && (
        <div className="time-layout">
          <section className="panel time-sheet">
            <div className="time-head">
              <div>
                <h2>Feuille de temps — 27 juillet au 2 août</h2>
                <p>
                  Saisie quotidienne rattachée au dossier, à l’activité et à la
                  convention.
                </p>
              </div>
              <button className="primary" onClick={() => setModal(true)}>
                ＋ Saisir du temps
              </button>
            </div>
            <div className="week-grid">
              {[
                ["Lun", "7h30", 94],
                ["Mar", "8h00", 100],
                ["Mer", "7h45", 97],
                ["Jeu", "8h15", 100],
                ["Ven", "5h15", 66],
                ["Sam", "—", 0],
                ["Dim", "—", 0],
              ].map((x, i) => (
                <div className={i === 4 ? "today" : ""} key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                  <div>
                    <i style={{ height: x[2] + "%" }} />
                  </div>
                  <small>
                    {i === 4 ? "Aujourd’hui" : i > 4 ? "Repos" : "Complet"}
                  </small>
                </div>
              ))}
            </div>
            <div className="time-entry header">
              <span>Date</span>
              <span>Dossier / activité</span>
              <span>Intervenant</span>
              <span>Durée</span>
              <span>Nature</span>
              <span>Statut</span>
            </div>
            {entries.map((x, i) => (
              <div className="time-entry" key={i}>
                <span>{x[0]}</span>
                <span>
                  <b>{x[2]}</b>
                  <small>{x[1]}</small>
                </span>
                <span>{x[3]}</span>
                <strong>{x[4]}</strong>
                <span>{x[5]}</span>
                <i className={`time-status s${i}`}>{x[6]}</i>
              </div>
            ))}
          </section>
          <aside>
            <div className="panel timer-card">
              <span>CHRONOMÈTRE</span>
              <strong>01:24:36</strong>
              <p>
                IL-2026-0091
                <br />
                <b>Préparation de l’audience</b>
              </p>
              <div>
                <button onClick={() => notify("Chronomètre mis en pause")}>
                  Ⅱ Pause
                </button>
                <button
                  onClick={() => notify("Temps arrêté et brouillon créé")}
                >
                  ■ Arrêter
                </button>
              </div>
            </div>
            <div className="panel missing-time">
              <span>SAISIE À COMPLÉTER</span>
              <h3>Vendredi : 2 h 45 manquantes</h3>
              <p>L’agenda contient deux activités sans temps correspondant.</p>
              <button onClick={() => notify("Suggestions de temps ouvertes")}>
                Voir les suggestions
              </button>
            </div>
          </aside>
        </div>
      )}
      {tab === "Équipe" && (
        <div className="panel team-time">
          <div className="time-head">
            <div>
              <h2>Suivi du temps de l’équipe</h2>
              <p>Semaine en cours • objectifs adaptés aux rôles.</p>
            </div>
            <button
              className="secondary"
              onClick={() => notify("Suivi du temps exporté")}
            >
              Exporter
            </button>
          </div>
          <div className="team-time-row header">
            <span>Professionnel</span>
            <span>Saisi</span>
            <span>Facturable</span>
            <span>Taux</span>
            <span>Objectif</span>
            <span>Écart</span>
          </div>
          {[
            ["Sara Benali", "36h45", "31h15", "85%", "40h", "−3h15"],
            ["Nadia El Idrissi", "39h30", "35h45", "91%", "40h", "−0h30"],
            ["Youssef Amrani", "42h15", "38h30", "91%", "40h", "+2h15"],
            ["Meryem Alaoui", "34h00", "28h45", "85%", "38h", "−4h00"],
          ].map((x, i) => (
            <div className="team-time-row" key={i}>
              <b>{x[0]}</b>
              {x.slice(1).map((v, j) => (
                <span
                  className={
                    j === 4 ? (v.startsWith("+") ? "positive" : "negative") : ""
                  }
                  key={j}
                >
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {tab === "À valider" && (
        <div className="panel approvals-time">
          <div className="time-head">
            <div>
              <h2>Temps à valider</h2>
              <p>Contrôle avant valorisation et préfacturation.</p>
            </div>
            <button
              className="primary"
              onClick={() => notify("Saisies conformes validées en lot")}
            >
              ✓ Valider la sélection
            </button>
          </div>
          {entries
            .filter((x) => x[6] !== "Validé")
            .map((x, i) => (
              <label className="approval-time-row" key={i}>
                <input type="checkbox" />
                <span>
                  <b>{x[2]}</b>
                  <small>
                    {x[1]} • {x[3]}
                  </small>
                </span>
                <strong>{x[4]}</strong>
                <i>{x[5]}</i>
                <button onClick={() => notify("Détail de la saisie ouvert")}>
                  Examiner
                </button>
              </label>
            ))}
        </div>
      )}
      {tab === "Analyse" && (
        <div className="time-analysis">
          <section className="panel">
            <div className="time-head">
              <div>
                <h2>Facturable vs non facturable</h2>
                <p>Évolution sur huit semaines.</p>
              </div>
              <button
                className="secondary"
                onClick={() => notify("Période affichée : 8 semaines")}
              >
                8 semaines
              </button>
            </div>
            <div className="time-chart">
              {[78, 82, 79, 86, 84, 88, 83, 85].map((x, i) => (
                <div key={i}>
                  <i style={{ height: x * 1.8 + "px" }}>
                    <b style={{ height: (100 - x) * 1.8 + "px" }} />
                  </i>
                  <span>S{24 + i}</span>
                </div>
              ))}
            </div>
            <div className="time-legend">
              <span>
                <i /> Facturable
              </span>
              <span>
                <i className="internal" /> Interne
              </span>
            </div>
          </section>
          <aside className="panel utilization-card">
            <span>TAUX FACTURABLE</span>
            <strong>85%</strong>
            <p>Objectif cabinet : 82 %</p>
            <div>
              <i style={{ width: "85%" }} />
            </div>
            <small>+3 points au-dessus de l’objectif</small>
          </aside>
        </div>
      )}
      {modal && (
        <TimeEntryModal onClose={() => setModal(false)} notify={notify} />
      )}
    </div>
  );
}

function TimeEntryModal({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal time-modal">
        <div className="modal-head">
          <div>
            <span>NOUVELLE SAISIE</span>
            <h2>Saisir du temps</h2>
            <p>Le tarif est déterminé par la convention du dossier.</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="time-form">
          <label>
            Date
            <input type="date" defaultValue="2026-08-01" />
          </label>
          <label>
            Dossier
            <select defaultValue="IL-2026-0091">
              <option>IL-2026-0091 • Société Atlas</option>
              <option>IL-2026-0087 • Groupe Andalous</option>
              <option>INTERNE • Cabinet</option>
            </select>
          </label>
          <label>
            Durée
            <input defaultValue="01:30" />
          </label>
          <label>
            Nature
            <select defaultValue="Facturable">
              <option>Facturable</option>
              <option>Non facturable</option>
            </select>
          </label>
          <label className="wide">
            Activité
            <textarea defaultValue="Préparation et revue des pièces pour l’audience." />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Enregistrer comme brouillon
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Temps enregistré et soumis à validation");
              onClose();
            }}
          >
            Enregistrer et soumettre
          </button>
        </div>
      </div>
    </div>
  );
}
