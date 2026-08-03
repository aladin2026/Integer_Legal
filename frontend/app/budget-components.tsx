"use client";

import { useState } from "react";

export function CabinetBudgets({ notify }: { notify: (x: string) => void }) {
  const [period, setPeriod] = useState("Exercice 2026");
  const [dialog, setDialog] = useState(false);
  const lines = [
    [
      "Honoraires & abonnements",
      "6 400 000",
      "3 710 000",
      "—",
      "6 180 000",
      "−220 000",
      "warn",
    ],
    [
      "Masse salariale",
      "2 480 000",
      "1 390 000",
      "1 055 000",
      "2 505 000",
      "−25 000",
      "warn",
    ],
    [
      "Locaux & fonctionnement",
      "640 000",
      "355 000",
      "248 000",
      "625 000",
      "+15 000",
      "good",
    ],
    [
      "Technologie & données",
      "420 000",
      "219 000",
      "172 000",
      "438 000",
      "−18 000",
      "warn",
    ],
    [
      "Marketing & développement",
      "210 000",
      "98 000",
      "66 000",
      "196 000",
      "+14 000",
      "good",
    ],
    [
      "Investissements",
      "110 000",
      "42 000",
      "35 000",
      "94 000",
      "+16 000",
      "good",
    ],
  ];
  return (
    <div className="cabinet-budgets">
      <div className="budget-controls">
        <div>
          {["Exercice 2026", "T3 2026", "Juillet"].map((x) => (
            <button
              className={period === x ? "active" : ""}
              onClick={() => setPeriod(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <button
          className="secondary"
          onClick={() => notify("Export budgétaire préparé")}
        >
          Exporter
        </button>
        <button className="primary" onClick={() => setDialog(true)}>
          ＋ Réviser le budget
        </button>
      </div>
      <div className="budget-summary cabinet">
        {[
          [
            "Chiffre d’affaires prévu",
            "6 400 000 DH",
            "Réalisé : 3 710 000 DH • 58 %",
          ],
          ["Charges prévues", "3 860 000 DH", "Engagées : 2 148 000 DH • 56 %"],
          ["Résultat prévisionnel", "2 540 000 DH", "Marge cible : 39,7 %"],
          ["Trésorerie projetée", "1 280 000 DH", "À fin décembre 2026"],
        ].map((x) => (
          <div className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
          </div>
        ))}
      </div>
      <div className="budget-grid cabinet-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>Budget du cabinet — {period}</h2>
            <button
              onClick={() =>
                notify("Historique des versions budgétaires ouvert")
              }
            >
              Version approuvée n°2 <span>›</span>
            </button>
          </div>
          <div className="cabinet-budget-head">
            <span>Poste budgétaire</span>
            <span>Budget annuel</span>
            <span>Réalisé</span>
            <span>Engagé</span>
            <span>Atterrissage</span>
            <span>Écart</span>
          </div>
          {lines.map((x, i) => (
            <div className="cabinet-budget-row" key={i}>
              <b>{x[0]}</b>
              {x.slice(1, 6).map((v, j) => (
                <span className={j === 4 ? x[6] : ""} key={j}>
                  {v}
                  {v === "—" ? "" : " DH"}
                </span>
              ))}
              <div className="row-progress">
                <i style={{ width: [97, 100, 98, 100, 93, 85][i] + "%" }} />
              </div>
            </div>
          ))}
        </section>
        <aside>
          <div className="panel forecast-card">
            <div className="panel-title">
              <h2>Prévision de clôture</h2>
              <button
                onClick={() => notify("Détail de l’actualisation ouvert")}
              >
                Actualisée aujourd’hui
              </button>
            </div>
            <div className="forecast-ring">
              <div>
                <b>96,6%</b>
                <span>du CA cible</span>
              </div>
            </div>
            <p>
              L’atterrissage prévoit un chiffre d’affaires inférieur de{" "}
              <b>220 000 DH</b> à l’objectif annuel.
            </p>
            <button
              className="secondary"
              onClick={() => notify("Scénario de clôture ouvert")}
            >
              Simuler un scénario
            </button>
          </div>
          <div className="panel">
            <div className="panel-title">
              <h2>Alertes budgétaires</h2>
              <button onClick={() => notify("3 alertes budgétaires affichées")}>
                3 actives
              </button>
            </div>
            {[
              ["Revenus", "Retard de 220 000 DH sur l’objectif", "red"],
              ["Technologie", "Atterrissage supérieur de 4,3 %", "amber"],
              ["Masse salariale", "Seuil annuel atteint à 101 %", "amber"],
            ].map((x) => (
              <div className="capacity-alert" key={x[0]}>
                <i className={x[2]} />
                <div>
                  <b>{x[0]}</b>
                  <span>{x[1]}</span>
                </div>
                <button onClick={() => notify(`Alerte ${x[0]} ouverte`)}>
                  Traiter
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
      {dialog && (
        <div className="modal-backdrop">
          <div className="intake-modal budget-dialog">
            <div className="modal-head">
              <div>
                <span>RÉVISION BUDGÉTAIRE</span>
                <h2>Préparer une nouvelle version</h2>
                <p>La version approuvée reste inchangée jusqu’à validation.</p>
              </div>
              <button onClick={() => setDialog(false)}>×</button>
            </div>
            <div className="budget-dialog-body">
              <label>
                Période
                <select defaultValue="Exercice 2026">
                  <option>Exercice 2026</option>
                  <option>T3 2026</option>
                </select>
              </label>
              <label>
                Poste budgétaire
                <select defaultValue="Honoraires & abonnements">
                  <option>Honoraires & abonnements</option>
                  <option>Masse salariale</option>
                  <option>Technologie & données</option>
                </select>
              </label>
              <label>
                Nouveau montant
                <input defaultValue="6 650 000" />
                <span>DH</span>
              </label>
              <label>
                Justification
                <textarea defaultValue="Révision de l’objectif commercial selon le portefeuille signé et les opportunités pondérées." />
              </label>
            </div>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setDialog(false)}>
                Annuler
              </button>
              <button
                className="primary"
                onClick={() => {
                  notify(
                    "Révision budgétaire soumise au circuit de validation",
                  );
                  setDialog(false);
                }}
              >
                Soumettre pour validation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
