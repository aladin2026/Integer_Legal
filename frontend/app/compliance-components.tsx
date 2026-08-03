"use client";
import { useState } from "react";
import { announceAction } from "./ui-actions";

export function ComplianceManagement({
  notify,
}: {
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("Vue d’ensemble"),
    [modal, setModal] = useState(false);
  return (
    <div className="compliance-management">
      <div className="compliance-tabs">
        {[
          "Vue d’ensemble",
          "Vigilance KYC",
          "Barrières",
          "Incidents",
          "Politiques",
        ].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
            {x === "Incidents" && <em>2</em>}
          </button>
        ))}
      </div>
      <div className="compliance-kpis">
        {[
          ["Score de conformité", "91 %", "Objectif : 95 %"],
          ["Revues KYC à venir", "8", "Dans les 30 jours"],
          ["Alertes ouvertes", "4", "2 prioritaires"],
          ["Barrières actives", "6", "14 personnes concernées"],
          ["Actions en retard", "3", "Responsables notifiés"],
        ].map((x, i) => (
          <article className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small
              className={i === 2 || i === 4 ? "warn" : i === 0 ? "good" : ""}
            >
              {x[2]}
            </small>
          </article>
        ))}
      </div>
      {tab === "Vue d’ensemble" && (
        <div className="compliance-overview">
          <section>
            <div className="panel control-register">
              <Head
                title="Contrôles prioritaires"
                text="Obligations, preuves et responsables réunis dans un registre unique."
                action="Voir le registre"
              />
              {[
                [
                  "red",
                  "KYC à renouveler — Groupe Andalous",
                  "Client • Revue annuelle",
                  "N. El Idrissi",
                  "Échéance : 3 août",
                ],
                [
                  "amber",
                  "Attestation d’assurance professionnelle",
                  "Cabinet • Document à actualiser",
                  "S. Benali",
                  "Échéance : 8 août",
                ],
                [
                  "blue",
                  "Revue de la barrière Atlas / Maroc Distribution",
                  "Dossiers sensibles • Accès restreint",
                  "Admin conformité",
                  "Revue : 12 août",
                ],
                [
                  "green",
                  "Contrôle trimestriel des habilitations",
                  "Sécurité • 47 comptes revus",
                  "Admin technique",
                  "Terminé le 30 juil.",
                ],
              ].map((x) => (
                <article className="control-row" key={x[1]}>
                  <i className={x[0]} />
                  <span>
                    <b>{x[1]}</b>
                    <small>{x[2]}</small>
                  </span>
                  <span>
                    <small>Responsable</small>
                    <b>{x[3]}</b>
                  </span>
                  <time>{x[4]}</time>
                  <button onClick={() => notify("Contrôle et preuves ouverts")}>
                    ›
                  </button>
                </article>
              ))}
            </div>
            <div className="panel risk-map">
              <Head
                title="Carte des risques du cabinet"
                text="Exposition résiduelle après contrôles."
                action="Matrice complète"
              />
              <div className="risk-matrix">
                <span>Impact</span>
                {[
                  ["Faible", 2, 5, 8],
                  ["Moyen", 3, 6, 4],
                  ["Élevé", 1, 3, 2],
                ].map((x, i) => (
                  <div key={x[0] as string}>
                    <b>{x[0]}</b>
                    {x.slice(1).map((v, j) => (
                      <i className={`rm${i}${j}`} key={j}>
                        {v}
                      </i>
                    ))}
                  </div>
                ))}
                <footer>
                  <span>Faible</span>
                  <span>Probabilité</span>
                  <span>Élevée</span>
                </footer>
              </div>
              <div className="risk-legend">
                <span>
                  <i className="low" /> Maîtrisé
                </span>
                <span>
                  <i className="medium" /> À surveiller
                </span>
                <span>
                  <i className="high" /> Prioritaire
                </span>
              </div>
            </div>
          </section>
          <aside>
            <div className="panel compliance-score">
              <span>MATURITÉ CONFORMITÉ</span>
              <strong>91</strong>
              <small>/100</small>
              <div>
                <i style={{ width: "91%" }} />
              </div>
              <p>
                Bon niveau global. Renforcer les revues KYC et les délais de
                remédiation.
              </p>
            </div>
            <div className="panel action-plan">
              <span>PLAN D’ACTION</span>
              {[
                ["Ouvertes", "12"],
                ["À échéance ce mois", "7"],
                ["En retard", "3"],
                ["Clôturées ce trimestre", "26"],
              ].map((x) => (
                <div key={x[0]}>
                  <b>{x[0]}</b>
                  <strong>{x[1]}</strong>
                </div>
              ))}
              <button className="primary" onClick={() => setModal(true)}>
                ＋ Nouvelle action
              </button>
            </div>
          </aside>
        </div>
      )}
      {tab === "Vigilance KYC" && (
        <section className="panel kyc-register">
          <Head
            title="Registre de vigilance"
            text="Identification, bénéficiaires effectifs, niveau de risque et revues périodiques."
            action="Exporter"
          />
          <div className="kyc-row header">
            <span>Client / relation</span>
            <span>Risque</span>
            <span>Dossier</span>
            <span>Dernière revue</span>
            <span>Prochaine revue</span>
            <span>Statut</span>
            <span />
          </div>
          {[
            [
              "Société Atlas",
              "Faible",
              "IL-2026-0091",
              "15 juin 2026",
              "15 juin 2027",
              "À jour",
            ],
            [
              "Groupe Andalous",
              "Élevé",
              "IL-2026-0087",
              "3 août 2025",
              "3 août 2026",
              "À renouveler",
            ],
            [
              "Horizon Capital",
              "Moyen",
              "IL-2026-0064",
              "12 avril 2026",
              "12 avril 2027",
              "À jour",
            ],
            [
              "Logis Nord",
              "Moyen",
              "IL-2026-0042",
              "8 octobre 2025",
              "8 octobre 2026",
              "Pièce requise",
            ],
            [
              "Maghreb Renewables",
              "Moyen",
              "Sollicitation",
              "31 juillet 2026",
              "Avant acceptation",
              "En cours",
            ],
          ].map((x, i) => (
            <button
              className="kyc-row"
              key={x[0]}
              onClick={() => notify("Dossier de vigilance ouvert")}
            >
              <span>
                <b>{x[0]}</b>
                <small>
                  {i === 1
                    ? "Bénéficiaire effectif à confirmer"
                    : "Identité vérifiée"}
                </small>
              </span>
              <i className={`kyc-risk kr${i}`}>{x[1]}</i>
              <span>{x[2]}</span>
              <span>{x[3]}</span>
              <time>{x[4]}</time>
              <em className={`kyc-status ks${i}`}>{x[5]}</em>
              <i>›</i>
            </button>
          ))}
        </section>
      )}
      {tab === "Barrières" && (
        <div className="barrier-layout">
          <section className="panel">
            <Head
              title="Barrières d’information actives"
              text="Restrictions nominatives, motifs, périmètre et revues obligatoires."
              action="Historique"
            />
            {[
              [
                "BI-2026-006",
                "Atlas / Maroc Distribution",
                "2 dossiers • 7 personnes",
                "S. Benali",
                "12 août 2026",
                "Active",
              ],
              [
                "BI-2026-005",
                "Projet Horizon — acquisition",
                "1 dossier • 5 personnes",
                "Y. Amrani",
                "30 septembre 2026",
                "Active",
              ],
              [
                "BI-2026-004",
                "Groupe Andalous — restructuration",
                "3 dossiers • 9 personnes",
                "N. El Idrissi",
                "15 août 2026",
                "À revoir",
              ],
            ].map((x, i) => (
              <div className="barrier-row" key={x[0]}>
                <span className="barrier-icon">▥</span>
                <span>
                  <b>{x[1]}</b>
                  <small>
                    {x[0]} • {x[2]}
                  </small>
                </span>
                <span>
                  <small>Propriétaire</small>
                  <b>{x[3]}</b>
                </span>
                <time>{x[4]}</time>
                <i className={i === 2 ? "review" : ""}>{x[5]}</i>
                <button onClick={() => notify("Barrière et membres ouverts")}>
                  Gérer
                </button>
              </div>
            ))}
          </section>
          <aside className="panel barrier-rule">
            <span>PRINCIPE DE SÉCURITÉ</span>
            <h3>Refus par défaut</h3>
            <p>
              Un rôle général ne donne jamais accès à un dossier protégé. Seule
              une autorisation nominative, motivée et tracée ouvre l’accès.
            </p>
            <div>
              <b>6 barrières actives</b>
              <small>14 personnes restreintes</small>
              <small>100 % des accès tracés</small>
            </div>
            <button onClick={() => notify("Nouvelle barrière préparée")}>
              Créer une barrière
            </button>
          </aside>
        </div>
      )}
      {tab === "Incidents" && (
        <section className="panel incident-register">
          <div className="compliance-title">
            <div>
              <h2>Incidents et signalements</h2>
              <p>
                Qualification, confinement, analyse et clôture avec preuves.
              </p>
            </div>
            <button
              className="primary"
              onClick={() => notify("Formulaire de signalement ouvert")}
            >
              ＋ Signaler
            </button>
          </div>
          {[
            [
              "INC-2026-0012",
              "Partage erroné d’un brouillon au portail",
              "Confidentialité",
              "Élevé",
              "Confiné",
              "S. Benali",
              "Aujourd’hui, 10:18",
            ],
            [
              "INC-2026-0011",
              "Tentative d’accès à un dossier restreint",
              "Sécurité",
              "Moyen",
              "En analyse",
              "Admin sécurité",
              "30 juil., 16:42",
            ],
            [
              "INC-2026-0010",
              "Document conservé au-delà de la durée prévue",
              "Conservation",
              "Faible",
              "Planifié",
              "M. Alaoui",
              "28 juil., 09:25",
            ],
          ].map((x, i) => (
            <article className="incident-row" key={x[0]}>
              <i className={`incident-severity is${i}`}>!</i>
              <span>
                <b>{x[1]}</b>
                <small>
                  {x[0]} • {x[2]}
                </small>
              </span>
              <em>{x[3]}</em>
              <strong>{x[4]}</strong>
              <span>
                <small>Responsable</small>
                <b>{x[5]}</b>
              </span>
              <time>{x[6]}</time>
              <button onClick={() => notify("Incident et chronologie ouverts")}>
                ›
              </button>
            </article>
          ))}
        </section>
      )}
      {tab === "Politiques" && (
        <div className="policy-grid">
          {[
            [
              "VIG",
              "Politique de vigilance client",
              "v3.2",
              "Revue : 30 juin 2026",
              "Active",
            ],
            [
              "SEC",
              "Sécurité de l’information",
              "v4.0",
              "Revue : 15 juillet 2026",
              "Active",
            ],
            [
              "RET",
              "Conservation & destruction",
              "v2.4",
              "Revue : 20 mai 2026",
              "À revoir",
            ],
            [
              "INC",
              "Gestion des incidents",
              "v2.1",
              "Revue : 12 juillet 2026",
              "Active",
            ],
            [
              "BCP",
              "Continuité d’activité",
              "v1.8",
              "Test : 4 juin 2026",
              "Active",
            ],
            [
              "ETH",
              "Éthique & indépendance",
              "v3.0",
              "Revue : 1 juillet 2026",
              "Active",
            ],
          ].map((x, i) => (
            <article className="panel policy-card" key={x[1]}>
              <div>
                <i className={`pc${i}`}>{x[0]}</i>
                <em className={i === 2 ? "review" : ""}>{x[4]}</em>
              </div>
              <h3>{x[1]}</h3>
              <p>
                {x[2]} • {x[3]}
              </p>
              <footer>
                <span>Approbation requise : Comité conformité</span>
                <button
                  onClick={() => notify("Politique et versions ouvertes")}
                >
                  Ouvrir ›
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
      {modal && <ActionModal close={() => setModal(false)} notify={notify} />}
    </div>
  );
}
function Head({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: string;
}) {
  return (
    <div className="compliance-title">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <button
        className="secondary"
        onClick={() => announceAction(`${action} — ${title}`)}
      >
        {action}
      </button>
    </div>
  );
}
function ActionModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal compliance-modal">
        <div className="modal-head">
          <div>
            <span>REMÉDIATION</span>
            <h2>Créer une action de conformité</h2>
            <p>
              L’action sera liée au risque, au responsable et aux preuves
              attendues.
            </p>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="compliance-form">
          <label className="wide">
            Action
            <input placeholder="Ex. Renouveler les pièces KYC du client" />
          </label>
          <label>
            Domaine
            <select>
              <option>Vigilance client</option>
              <option>Confidentialité</option>
              <option>Sécurité</option>
              <option>Conservation</option>
            </select>
          </label>
          <label>
            Responsable
            <select>
              <option>Nadia El Idrissi</option>
              <option>Sara Benali</option>
              <option>Admin conformité</option>
            </select>
          </label>
          <label>
            Échéance
            <input type="date" defaultValue="2026-08-08" />
          </label>
          <label>
            Priorité
            <select>
              <option>Normale</option>
              <option>Haute</option>
              <option>Critique</option>
            </select>
          </label>
          <label className="wide">
            Preuve attendue
            <textarea placeholder="Document, validation ou contrôle permettant de clôturer l’action…" />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            Annuler
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Action créée — responsable notifié");
              close();
            }}
          >
            Créer l’action
          </button>
        </div>
      </div>
    </div>
  );
}
