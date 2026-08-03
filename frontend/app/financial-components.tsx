"use client";

import { useState } from "react";

export function FeeManagement({ notify }: { notify: (x: string) => void }) {
  const [tab, setTab] = useState("Conventions");
  const [modal, setModal] = useState<
    "agreement" | "expense" | "provision" | null
  >(null);
  const agreements = [
    [
      "Société Atlas",
      "IL-2026-0091",
      "Temps passé",
      "235 000 DH",
      "63%",
      "Active",
    ],
    [
      "Groupe Andalous",
      "IL-2026-0087",
      "Forfait par phase",
      "180 000 DH",
      "71%",
      "À revoir",
    ],
    [
      "Horizon Capital",
      "IL-2026-0064",
      "Forfait + succès",
      "420 000 DH",
      "44%",
      "Active",
    ],
    [
      "Logis Nord",
      "IL-2026-0042",
      "Abonnement mensuel",
      "18 000 DH/mois",
      "82%",
      "Active",
    ],
  ];
  return (
    <div className="fee-management">
      <div className="fee-tabs">
        {["Conventions", "Provisions", "Frais & débours", "Rentabilité"].map(
          (x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="fee-kpis">
        {[
          ["Production HT", "486 200 DH", "+12,4 % sur 90 jours"],
          ["Préfacturable", "126 400 DH", "42 h à valider"],
          ["Provisions disponibles", "174 000 DH", "6 dossiers couverts"],
          ["Frais à refacturer", "28 650 DH", "9 justificatifs"],
          ["Marge estimée", "41,8 %", "Objectif : 40 %"],
        ].map((x, i) => (
          <div className="panel" key={i}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 2 ? "amber" : ""}>{x[2]}</small>
          </div>
        ))}
      </div>
      {tab === "Conventions" && (
        <div className="panel fee-panel">
          <div className="fee-head">
            <div>
              <h2>Conventions d’honoraires</h2>
              <p>Règles tarifaires versionnées et liées aux dossiers.</p>
            </div>
            <button className="primary" onClick={() => setModal("agreement")}>
              ＋ Nouvelle convention
            </button>
          </div>
          <div className="agreement-row header">
            <span>Client / dossier</span>
            <span>Modèle</span>
            <span>Plafond / montant</span>
            <span>Consommation</span>
            <span>Statut</span>
            <span></span>
          </div>
          {agreements.map((x, i) => (
            <div className="agreement-row" key={i}>
              <span>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </span>
              <span>{x[2]}</span>
              <span>
                <b>{x[3]}</b>
              </span>
              <span>
                <div className="fee-progress">
                  <i style={{ width: x[4] }} />
                </div>
                <small>{x[4]}</small>
              </span>
              <span>
                <i
                  className={
                    x[5] === "À revoir" ? "fee-status warn" : "fee-status"
                  }
                >
                  {x[5]}
                </i>
              </span>
              <button onClick={() => notify(`Convention ${x[1]} ouverte`)}>
                ›
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "Provisions" && (
        <div className="fee-layout">
          <section className="panel fee-panel">
            <div className="fee-head">
              <div>
                <h2>Provisions et avances</h2>
                <p>Solde disponible et affectation par dossier.</p>
              </div>
              <button className="primary" onClick={() => setModal("provision")}>
                ＋ Enregistrer une provision
              </button>
            </div>
            <div className="provision-row header">
              <span>Référence</span>
              <span>Client</span>
              <span>Reçue</span>
              <span>Utilisée</span>
              <span>Disponible</span>
              <span>Statut</span>
            </div>
            {[
              [
                "PROV-0261",
                "Société Atlas",
                "100 000",
                "62 500",
                "37 500",
                "Partielle",
              ],
              [
                "PROV-0254",
                "Horizon Capital",
                "150 000",
                "48 000",
                "102 000",
                "Disponible",
              ],
              [
                "PROV-0248",
                "Groupe Andalous",
                "75 000",
                "40 500",
                "34 500",
                "Partielle",
              ],
            ].map((x, i) => (
              <div className="provision-row" key={i}>
                {x.map((v, j) => (
                  <span key={j} className={j === 4 ? "amount-good" : ""}>
                    {v}
                    {j > 1 && j < 5 ? " DH" : ""}
                  </span>
                ))}
              </div>
            ))}
          </section>
          <aside className="panel provision-summary">
            <h3>Couverture du portefeuille</h3>
            <div className="coverage-ring">
              <div>
                <b>68%</b>
                <span>couvert</span>
              </div>
            </div>
            <p>
              6 dossiers disposent d’une provision suffisante. 2 dossiers
              nécessitent une demande complémentaire.
            </p>
            <button
              className="secondary"
              onClick={() => notify("Demandes complémentaires préparées")}
            >
              Préparer les demandes
            </button>
          </aside>
        </div>
      )}
      {tab === "Frais & débours" && (
        <div className="panel fee-panel">
          <div className="fee-head">
            <div>
              <h2>Frais et débours</h2>
              <p>Justificatifs, validation et refacturation au client.</p>
            </div>
            <button className="primary" onClick={() => setModal("expense")}>
              ＋ Saisir un frais
            </button>
          </div>
          <div className="expense-row header">
            <span>Date</span>
            <span>Nature / dossier</span>
            <span>Collaborateur</span>
            <span>Montant</span>
            <span>Justificatif</span>
            <span>Traitement</span>
          </div>
          {[
            [
              "31 juil.",
              "Frais de greffe • IL-2026-0091",
              "N. El Idrissi",
              "1 250 DH",
              "PDF joint",
              "À valider",
            ],
            [
              "30 juil.",
              "Déplacement Rabat • IL-2026-0087",
              "S. Benali",
              "860 DH",
              "Reçu joint",
              "Validé",
            ],
            [
              "29 juil.",
              "Traduction assermentée • IL-2026-0064",
              "Y. Amrani",
              "4 800 DH",
              "Facture jointe",
              "Refacturable",
            ],
            [
              "28 juil.",
              "Huissier • IL-2026-0042",
              "M. Alaoui",
              "2 400 DH",
              "PDF joint",
              "Validé",
            ],
          ].map((x, i) => (
            <div className="expense-row" key={i}>
              {x.map((v, j) => (
                <span key={j} className={j === 5 ? `expense-status s${i}` : ""}>
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {tab === "Rentabilité" && (
        <div className="profitability-grid">
          <section className="panel">
            <div className="fee-head">
              <div>
                <h2>Rentabilité par dossier</h2>
                <p>Production valorisée, coût interne et marge estimée.</p>
              </div>
              <button
                className="secondary"
                onClick={() => notify("Analyse de rentabilité exportée")}
              >
                Exporter l’analyse
              </button>
            </div>
            <div className="profit-detail header">
              <span>Dossier</span>
              <span>Production</span>
              <span>Coût interne</span>
              <span>Marge</span>
              <span>Écart budget</span>
            </div>
            {[
              ["Projet Horizon", "168 400", "80 832", "52%", "+28 000"],
              ["Atlas c/ Distribution", "148 600", "92 132", "38%", "+54 000"],
              ["Groupe Andalous", "112 900", "63 224", "44%", "+18 600"],
              ["Créances Logis Nord", "56 300", "42 788", "24%", "−6 400"],
            ].map((x, i) => (
              <div className="profit-detail" key={i}>
                <b>{x[0]}</b>
                <span>{x[1]} DH</span>
                <span>{x[2]} DH</span>
                <i className={i === 3 ? "low" : ""}>{x[3]}</i>
                <span className={i === 3 ? "negative" : "positive"}>
                  {x[4]} DH
                </span>
              </div>
            ))}
          </section>
          <aside className="panel margin-card">
            <h3>Marge cabinet</h3>
            <strong>41,8%</strong>
            <span>Objectif annuel : 40%</span>
            <div className="margin-bars">
              {[32, 38, 36, 43, 39, 42, 44, 41].map((x, i) => (
                <i key={i} style={{ height: x * 2 + "px" }}>
                  <b>{x}%</b>
                </i>
              ))}
            </div>
            <p>
              La marge reste au-dessus de l’objectif, mais le dossier Logis Nord
              requiert une revue tarifaire.
            </p>
            <button
              className="secondary"
              onClick={() => notify("Revue tarifaire ajoutée au plan d’action")}
            >
              Planifier la revue
            </button>
          </aside>
        </div>
      )}
      {modal && (
        <FeeModal type={modal} onClose={() => setModal(null)} notify={notify} />
      )}
    </div>
  );
}

function FeeModal({
  type,
  onClose,
  notify,
}: {
  type: "agreement" | "expense" | "provision";
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const meta = {
    agreement: [
      "NOUVELLE CONVENTION",
      "Créer une convention d’honoraires",
      "Convention préparée et soumise à validation",
    ],
    expense: [
      "NOUVEAU FRAIS",
      "Saisir un frais ou un débours",
      "Frais enregistré et envoyé en validation",
    ],
    provision: [
      "NOUVELLE PROVISION",
      "Enregistrer une avance client",
      "Provision enregistrée et affectée au dossier",
    ],
  }[type];
  return (
    <div className="modal-backdrop">
      <div className="intake-modal fee-modal">
        <div className="modal-head">
          <div>
            <span>{meta[0]}</span>
            <h2>{meta[1]}</h2>
            <p>Chaque modification est versionnée et tracée dans l’audit.</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="fee-form">
          <label>
            Client
            <select defaultValue="Société Atlas">
              <option>Société Atlas</option>
              <option>Groupe Andalous</option>
              <option>Horizon Capital</option>
            </select>
          </label>
          <label>
            Dossier
            <select defaultValue="IL-2026-0091">
              <option>IL-2026-0091</option>
              <option>IL-2026-0087</option>
              <option>IL-2026-0064</option>
            </select>
          </label>
          {type === "agreement" ? (
            <>
              <label>
                Modèle tarifaire
                <select defaultValue="Temps passé">
                  <option>Temps passé</option>
                  <option>Forfait</option>
                  <option>Abonnement</option>
                  <option>Honoraire de résultat</option>
                  <option>Mixte</option>
                </select>
              </label>
              <label>
                Plafond HT
                <input defaultValue="235 000" />
                <span>DH</span>
              </label>
            </>
          ) : (
            <>
              <label>
                {type === "expense" ? "Nature du frais" : "Montant reçu"}
                <input
                  defaultValue={
                    type === "expense" ? "Frais de greffe" : "100 000"
                  }
                />
                {type === "provision" && <span>DH</span>}
              </label>
              <label>
                Date
                <input type="date" defaultValue="2026-08-01" />
              </label>
            </>
          )}
          <label className="wide">
            Justification / observation
            <textarea defaultValue="Saisie de démonstration — validation requise avant prise en compte financière." />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            className="primary"
            onClick={() => {
              notify(meta[2]);
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
