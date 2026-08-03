"use client";

import { useState } from "react";

export function CollectionsManagement({
  notify,
}: {
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("À encaisser");
  const [modal, setModal] = useState<
    "payment" | "reminder" | "schedule" | null
  >(null);
  const invoices = [
    [
      "INV-2026-00421",
      "Société Atlas",
      "IL-2026-0091",
      "42 500 DH",
      "15 juil. 2026",
      "Payée",
      "0 DH",
    ],
    [
      "INV-2026-00436",
      "Groupe Andalous",
      "IL-2026-0087",
      "58 800 DH",
      "22 juil. 2026",
      "Partielle",
      "18 800 DH",
    ],
    [
      "INV-2026-00449",
      "Horizon Capital",
      "IL-2026-0064",
      "96 000 DH",
      "31 juil. 2026",
      "À échéance",
      "96 000 DH",
    ],
    [
      "INV-2026-00394",
      "Logis Nord",
      "IL-2026-0042",
      "38 200 DH",
      "30 juin 2026",
      "En retard",
      "38 200 DH",
    ],
  ];
  return (
    <div className="collections-management">
      <div className="collection-tabs">
        {["À encaisser", "Échéancier", "Relances", "Rapprochement"].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="collection-kpis">
        {[
          ["Facturé sur 90 jours", "486 200 DH", "Source : Integer e‑Invoice"],
          ["Encaissé", "422 900 DH", "Taux : 87 %"],
          ["À recevoir", "153 000 DH", "4 factures ouvertes"],
          ["En retard", "38 200 DH", "1 client • 32 jours"],
          ["DSO estimé", "34 jours", "Objectif : 30 jours"],
        ].map((x, i) => (
          <div className="panel" key={i}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 3 ? "danger" : i === 4 ? "warn" : ""}>
              {x[2]}
            </small>
          </div>
        ))}
      </div>
      {tab === "À encaisser" && (
        <div className="collection-grid">
          <section className="panel invoice-panel">
            <div className="collection-head">
              <div>
                <h2>Factures et soldes clients</h2>
                <p>
                  Lecture synchronisée depuis Integer e‑Invoice, sans
                  duplication de la facture officielle.
                </p>
              </div>
              <button className="primary" onClick={() => setModal("payment")}>
                ＋ Enregistrer un règlement
              </button>
            </div>
            <div className="invoice-row header">
              <span>Facture / client</span>
              <span>Dossier</span>
              <span>Montant</span>
              <span>Échéance</span>
              <span>Statut</span>
              <span>Solde</span>
            </div>
            {invoices.map((x, i) => (
              <div className="invoice-row" key={i}>
                <span>
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </span>
                <span>{x[2]}</span>
                <span>{x[3]}</span>
                <span>{x[4]}</span>
                <span>
                  <i className={`invoice-status s${i}`}>{x[5]}</i>
                </span>
                <span>
                  <b>{x[6]}</b>
                  <button
                    onClick={() =>
                      notify(`${x[0]} ouverte dans Integer e‑Invoice`)
                    }
                  >
                    ↗
                  </button>
                </span>
              </div>
            ))}
          </section>
          <aside>
            <div className="panel ageing-card">
              <h3>Balance âgée</h3>
              <div className="ageing-bar">
                <i style={{ width: "56%" }} />
                <i style={{ width: "19%" }} />
                <i style={{ width: "15%" }} />
                <i style={{ width: "10%" }} />
              </div>
              {[
                ["Non échu", "86 000 DH", "blue"],
                ["1–30 jours", "28 800 DH", "green"],
                ["31–60 jours", "23 200 DH", "amber"],
                ["+60 jours", "15 000 DH", "red"],
              ].map((x) => (
                <div className="ageing-line" key={x[0]}>
                  <i className={x[2]} />
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
              <button
                className="secondary"
                onClick={() => notify("Analyse de la balance âgée ouverte")}
              >
                Voir l’analyse
              </button>
            </div>
            <div className="panel collection-alert">
              <span>PRIORITÉ DE RECOUVREMENT</span>
              <h3>Logis Nord — 38 200 DH</h3>
              <p>
                Facture échue depuis 32 jours. Dernier rappel consulté le 28
                juillet.
              </p>
              <button onClick={() => setModal("reminder")}>
                Préparer une relance
              </button>
            </div>
          </aside>
        </div>
      )}
      {tab === "Échéancier" && (
        <div className="panel schedule-panel">
          <div className="collection-head">
            <div>
              <h2>Échéancier prévisionnel</h2>
              <p>Encaissements attendus et engagements négociés.</p>
            </div>
            <button className="primary" onClick={() => setModal("schedule")}>
              ＋ Nouvel échéancier
            </button>
          </div>
          <div className="schedule-weeks">
            {[
              ["S31", "74 500", "68 000", 91],
              ["S32", "96 000", "78 000", 81],
              ["S33", "52 400", "42 000", 80],
              ["S34", "88 000", "71 500", 81],
              ["S35", "64 200", "55 000", 86],
            ].map((x, i) => (
              <div className="schedule-week" key={i}>
                <span>{x[0]}</span>
                <div className="schedule-column">
                  <i style={{ height: (x[3] as number) * 1.6 + "px" }} />
                  <b>{x[1]} DH</b>
                  <small>Attendu</small>
                </div>
                <div className="schedule-column confirmed">
                  <i style={{ height: (x[3] as number) * 1.25 + "px" }} />
                  <b>{x[2]} DH</b>
                  <small>Confirmé</small>
                </div>
              </div>
            ))}
          </div>
          <div className="schedule-legend">
            <span>
              <i /> Attendu
            </span>
            <span>
              <i className="confirmed" /> Confirmé client
            </span>
          </div>
        </div>
      )}
      {tab === "Relances" && (
        <div className="reminder-layout">
          <section className="panel">
            <div className="collection-head">
              <div>
                <h2>Scénarios de relance</h2>
                <p>Communication graduée, validée et tracée.</p>
              </div>
              <button className="primary" onClick={() => setModal("reminder")}>
                ＋ Préparer une relance
              </button>
            </div>
            {[
              [
                "R1",
                "Rappel courtois",
                "J+3",
                "E-mail portail",
                "12 envoyés",
                "94% ouverts",
              ],
              [
                "R2",
                "Relance formelle",
                "J+15",
                "E-mail + notification",
                "5 envoyés",
                "80% ouverts",
              ],
              [
                "R3",
                "Escalade associée",
                "J+30",
                "Validation obligatoire",
                "1 active",
                "Logis Nord",
              ],
            ].map((x, i) => (
              <div className="reminder-row" key={i}>
                <i className={`r${i}`}>{x[0]}</i>
                <span>
                  <b>{x[1]}</b>
                  <small>
                    {x[2]} • {x[3]}
                  </small>
                </span>
                <span>{x[4]}</span>
                <span>{x[5]}</span>
                <button onClick={() => notify(`Scénario ${x[0]} ouvert`)}>
                  Configurer
                </button>
              </div>
            ))}
          </section>
          <aside className="panel promises-card">
            <h3>Promesses de règlement</h3>
            {[
              ["Groupe Andalous", "18 800 DH", "05 août", "Confirmée"],
              ["Logis Nord", "20 000 DH", "08 août", "À confirmer"],
              ["Horizon Capital", "96 000 DH", "15 août", "Prévue"],
            ].map((x, i) => (
              <div key={i}>
                <i className={`p${i}`} />
                <span>
                  <b>{x[0]}</b>
                  <small>
                    {x[1]} • {x[2]}
                  </small>
                </span>
                <em>{x[3]}</em>
              </div>
            ))}
          </aside>
        </div>
      )}
      {tab === "Rapprochement" && (
        <div className="reconciliation-layout">
          <section className="panel">
            <div className="collection-head">
              <div>
                <h2>Rapprochement des règlements</h2>
                <p>
                  Correspondance entre encaissements, provisions et factures.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => notify("Rapprochement automatique relancé")}
              >
                ↻ Rapprocher
              </button>
            </div>
            {[
              [
                "VIR-310726-8421",
                "Société Atlas",
                "42 500 DH",
                "INV-2026-00421",
                "Rapproché",
              ],
              [
                "VIR-300726-7934",
                "Groupe Andalous",
                "40 000 DH",
                "INV-2026-00436",
                "Rapproché",
              ],
              [
                "VIR-290726-7688",
                "Référence incomplète",
                "15 000 DH",
                "—",
                "À identifier",
              ],
              [
                "CHQ-280726-0182",
                "Horizon Capital",
                "25 000 DH",
                "Provision PROV-0254",
                "Proposé",
              ],
            ].map((x, i) => (
              <div className="reconcile-row" key={i}>
                <span>
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </span>
                <span>{x[2]}</span>
                <span>{x[3]}</span>
                <i className={`rec-status s${i}`}>{x[4]}</i>
                <button
                  onClick={() =>
                    notify(`${x[0]} — détail du rapprochement ouvert`)
                  }
                >
                  ›
                </button>
              </div>
            ))}
          </section>
          <aside className="panel reconcile-score">
            <span>TAUX DE RAPPROCHEMENT</span>
            <strong>92,4%</strong>
            <div>
              <i style={{ width: "92.4%" }} />
            </div>
            <p>
              3 opérations nécessitent une intervention humaine. Toute décision
              sera conservée dans l’audit.
            </p>
          </aside>
        </div>
      )}
      {modal && (
        <CollectionModal
          type={modal}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
    </div>
  );
}

function CollectionModal({
  type,
  onClose,
  notify,
}: {
  type: "payment" | "reminder" | "schedule";
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const meta = {
    payment: [
      "NOUVEAU RÈGLEMENT",
      "Enregistrer un encaissement",
      "Règlement enregistré et envoyé au rapprochement",
    ],
    reminder: [
      "RELANCE CLIENT",
      "Préparer une relance contrôlée",
      "Relance soumise à validation avant envoi",
    ],
    schedule: [
      "ÉCHÉANCIER CLIENT",
      "Créer un plan de règlement",
      "Échéancier créé et soumis à acceptation",
    ],
  }[type];
  return (
    <div className="modal-backdrop">
      <div className="intake-modal collection-modal">
        <div className="modal-head">
          <div>
            <span>{meta[0]}</span>
            <h2>{meta[1]}</h2>
            <p>
              Les opérations financières sont corrélées avec Integer e‑Invoice
              et tracées.
            </p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="collection-form">
          <label>
            Client
            <select defaultValue="Logis Nord">
              <option>Logis Nord</option>
              <option>Société Atlas</option>
              <option>Groupe Andalous</option>
            </select>
          </label>
          <label>
            Facture
            <select defaultValue="INV-2026-00394">
              <option>INV-2026-00394 • 38 200 DH</option>
              <option>INV-2026-00436 • 18 800 DH</option>
            </select>
          </label>
          {type === "payment" ? (
            <>
              <label>
                Montant reçu
                <input defaultValue="38 200" />
                <span>DH</span>
              </label>
              <label>
                Mode
                <select defaultValue="Virement">
                  <option>Virement</option>
                  <option>Chèque</option>
                  <option>Carte</option>
                  <option>Espèces</option>
                </select>
              </label>
            </>
          ) : type === "reminder" ? (
            <>
              <label>
                Niveau
                <select defaultValue="R2 — Relance formelle">
                  <option>R1 — Rappel courtois</option>
                  <option>R2 — Relance formelle</option>
                  <option>R3 — Escalade associée</option>
                </select>
              </label>
              <label>
                Canal
                <select defaultValue="E-mail + portail">
                  <option>E-mail + portail</option>
                  <option>Portail uniquement</option>
                  <option>Courrier</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label>
                Premier versement
                <input defaultValue="20 000" />
                <span>DH</span>
              </label>
              <label>
                Nombre d’échéances
                <input type="number" defaultValue="2" />
              </label>
            </>
          )}
          <label className="wide">
            Observation
            <textarea defaultValue="Action de démonstration — validation requise avant exécution externe." />
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
            {type === "reminder" ? "Soumettre à validation" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
