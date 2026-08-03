"use client";
import { useState } from "react";
import { announceAction } from "./ui-actions";

export function QualityManagement({ notify }: { notify: (x: string) => void }) {
  const [tab, setTab] = useState("Tableau qualité"),
    [modal, setModal] = useState(false);
  return (
    <div className="quality-management">
      <div className="quality-tabs">
        {[
          "Tableau qualité",
          "Satisfaction",
          "Engagements",
          "Réclamations",
          "Revues de clôture",
        ].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
            {x === "Réclamations" && <em>2</em>}
          </button>
        ))}
      </div>
      <div className="quality-kpis">
        {[
          ["Satisfaction client", "8,7 / 10", "+0,4 ce trimestre"],
          ["Recommandation", "62", "Score relationnel"],
          ["Engagements tenus", "91 %", "Objectif : 95 %"],
          ["Réclamations ouvertes", "2", "1 réponse aujourd’hui"],
          ["Dossiers revus", "84 %", "22 sur 26 clôturés"],
        ].map((x, i) => (
          <article className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small
              className={i === 3 ? "warn" : i === 0 || i === 1 ? "good" : ""}
            >
              {x[2]}
            </small>
          </article>
        ))}
      </div>
      {tab === "Tableau qualité" && (
        <div className="quality-overview">
          <section>
            <div className="panel service-health">
              <Head
                title="Qualité de service par dimension"
                text="Mesure consolidée des retours clients et des données opérationnelles."
                action="90 jours"
              />
              <div className="quality-dimension header">
                <span>Dimension</span>
                <span>Score</span>
                <span>Évolution</span>
                <span>Objectif</span>
              </div>
              {[
                ["Expertise & pertinence", 94, "+2 pts", 92],
                ["Réactivité", 86, "−1 pt", 92],
                ["Clarté des communications", 89, "+4 pts", 90],
                ["Prévisibilité budgétaire", 82, "+3 pts", 88],
                ["Expérience portail", 91, "+5 pts", 90],
              ].map((x, i) => (
                <div className="quality-dimension" key={x[0] as string}>
                  <span>
                    <i className={`qd${i}`} />
                    <b>{x[0]}</b>
                  </span>
                  <span>
                    <strong>{x[1]}%</strong>
                    <div>
                      <i style={{ width: `${x[1]}%` }} />
                    </div>
                  </span>
                  <em
                    className={(x[2] as string).startsWith("−") ? "down" : ""}
                  >
                    {x[2]}
                  </em>
                  <small>{x[3]}%</small>
                </div>
              ))}
            </div>
            <div className="panel improvement-plan">
              <Head
                title="Plans d’amélioration prioritaires"
                text="Actions issues des retours, incidents et revues de dossiers."
                action="Voir tout"
              />
              {[
                [
                  "Budget",
                  "Améliorer l’alerte avant dépassement",
                  "Finance",
                  "12 août",
                  "En cours",
                  "65",
                ],
                [
                  "Réactivité",
                  "Réponse initiale sous 4 heures ouvrées",
                  "Équipe",
                  "8 août",
                  "À risque",
                  "48",
                ],
                [
                  "Portail",
                  "Simplifier la demande de pièces client",
                  "Produit",
                  "20 août",
                  "Planifié",
                  "20",
                ],
              ].map((x, i) => (
                <article className="improvement-row" key={x[1]}>
                  <i className={`improve-icon ii${i}`}>{x[0].slice(0, 1)}</i>
                  <span>
                    <b>{x[1]}</b>
                    <small>
                      {x[0]} • Responsable : {x[2]}
                    </small>
                  </span>
                  <time>{x[3]}</time>
                  <em className={`improve-status is${i}`}>{x[4]}</em>
                  <span className="improve-progress">
                    <i style={{ width: x[5] + "%" }} />
                  </span>
                  <button onClick={() => notify("Plan d’amélioration ouvert")}>
                    ›
                  </button>
                </article>
              ))}
            </div>
          </section>
          <aside>
            <div className="panel satisfaction-gauge">
              <span>SATISFACTION GLOBALE</span>
              <div>
                <strong>8,7</strong>
                <small>/10</small>
              </div>
              <p>142 réponses sur les 12 derniers mois</p>
              <div className="satisfaction-scale">
                <i style={{ width: "87%" }} />
              </div>
              <small className="positive">
                +0,4 depuis le trimestre précédent
              </small>
            </div>
            <div className="panel feedback-stream">
              <span>DERNIERS RETOURS</span>
              {[
                [
                  "SA",
                  "Société Atlas",
                  "9/10",
                  "Très bonne préparation de l’audience.",
                ],
                [
                  "HC",
                  "Horizon Capital",
                  "8/10",
                  "Plus de visibilité sur le budget serait utile.",
                ],
                [
                  "LN",
                  "Logis Nord",
                  "9/10",
                  "Réponses rapides et suivi clair.",
                ],
              ].map((x, i) => (
                <article key={x[1]}>
                  <span className={`mini-avatar a${i}`}>{x[0]}</span>
                  <span>
                    <b>
                      {x[1]} • {x[2]}
                    </b>
                    <p>“{x[3]}”</p>
                  </span>
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}
      {tab === "Satisfaction" && (
        <div className="satisfaction-layout">
          <section className="panel survey-register">
            <div className="quality-title">
              <div>
                <h2>Enquêtes et retours clients</h2>
                <p>
                  Enquêtes automatiques après jalon ou clôture, avec
                  consentement.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => notify("Nouvelle campagne préparée")}
              >
                ＋ Nouvelle enquête
              </button>
            </div>
            {[
              [
                "Enquête de clôture — T2 2026",
                "38 destinataires",
                "29 réponses",
                "76 %",
                "8,9 / 10",
                "Terminée",
              ],
              [
                "Retour après audience",
                "12 destinataires",
                "8 réponses",
                "67 %",
                "9,1 / 10",
                "En cours",
              ],
              [
                "Revue relation clients stratégiques",
                "8 destinataires",
                "5 réponses",
                "63 %",
                "8,6 / 10",
                "En cours",
              ],
              [
                "Expérience portail client",
                "46 destinataires",
                "31 réponses",
                "67 %",
                "8,4 / 10",
                "Terminée",
              ],
            ].map((x, i) => (
              <article className="survey-row" key={x[0]}>
                <span className={`survey-icon sv${i}`}>☆</span>
                <span>
                  <b>{x[0]}</b>
                  <small>
                    {x[1]} • {x[2]}
                  </small>
                </span>
                <span>
                  <small>Taux de réponse</small>
                  <b>{x[3]}</b>
                </span>
                <strong>{x[4]}</strong>
                <i>{x[5]}</i>
                <button
                  onClick={() => notify("Résultats de l’enquête ouverts")}
                >
                  Résultats ›
                </button>
              </article>
            ))}
          </section>
          <aside className="panel nps-card">
            <span>RÉPARTITION DES RETOURS</span>
            {[
              ["Promoteurs", 71, "101"],
              ["Passifs", 20, "28"],
              ["Détracteurs", 9, "13"],
            ].map((x, i) => (
              <div key={x[0] as string}>
                <span>
                  <b>{x[0]}</b>
                  <small>{x[2]} réponses</small>
                </span>
                <div>
                  <i className={`nps${i}`} style={{ width: `${x[1]}%` }} />
                </div>
                <strong>{x[1]}%</strong>
              </div>
            ))}
          </aside>
        </div>
      )}
      {tab === "Engagements" && (
        <section className="panel commitment-register">
          <Head
            title="Engagements de service"
            text="Niveaux de service convenus et performance mesurée par dossier."
            action="Configurer"
          />
          <div className="service-row header">
            <span>Engagement</span>
            <span>Cible</span>
            <span>Mesuré</span>
            <span>Conformité</span>
            <span>Tendance</span>
            <span>Responsable</span>
          </div>
          {[
            [
              "Accusé de réception client",
              "≤ 4 h ouvrées",
              "3 h 12",
              "94 %",
              "↗ +3 pts",
              "Équipe dossier",
            ],
            [
              "Compte rendu après audience",
              "≤ 24 h",
              "18 h 40",
              "91 %",
              "→ Stable",
              "Responsable dossier",
            ],
            [
              "Alerte budget consommé",
              "À 80 %",
              "82 %",
              "86 %",
              "↗ +6 pts",
              "Finance",
            ],
            [
              "Réponse aux demandes portail",
              "≤ 1 jour ouvré",
              "21 h",
              "89 %",
              "↘ −2 pts",
              "Équipe dossier",
            ],
            [
              "Préfacture après fin de mois",
              "≤ 5 jours",
              "4,2 jours",
              "93 %",
              "↗ +4 pts",
              "Finance",
            ],
          ].map((x, i) => (
            <div className="service-row" key={x[0]}>
              <b>{x[0]}</b>
              <span>{x[1]}</span>
              <span>{x[2]}</span>
              <strong className={i === 2 || i === 3 ? "caution" : ""}>
                {x[3]}
              </strong>
              <em className={i === 3 ? "down" : ""}>{x[4]}</em>
              <span>{x[5]}</span>
            </div>
          ))}
        </section>
      )}
      {tab === "Réclamations" && (
        <section className="panel complaint-register">
          <div className="quality-title">
            <div>
              <h2>Réclamations et insatisfactions</h2>
              <p>Réception, accusé, analyse, réponse et actions correctives.</p>
            </div>
            <button className="primary" onClick={() => setModal(true)}>
              ＋ Enregistrer
            </button>
          </div>
          {[
            [
              "REC-2026-0007",
              "Horizon Capital",
              "Écart entre budget et préfacture",
              "Élevée",
              "Réponse à valider",
              "S. Benali",
              "Aujourd’hui, 16:00",
            ],
            [
              "REC-2026-0006",
              "Groupe Andalous",
              "Délai de retour sur une demande",
              "Moyenne",
              "En analyse",
              "N. El Idrissi",
              "3 août, 12:00",
            ],
            [
              "REC-2026-0005",
              "Logis Nord",
              "Classement d’une pièce au portail",
              "Faible",
              "Clôturée",
              "M. Alaoui",
              "Clôturée le 28 juil.",
            ],
          ].map((x, i) => (
            <article className="complaint-row" key={x[0]}>
              <i className={`complaint-icon ci${i}`}>!</i>
              <span>
                <b>{x[2]}</b>
                <small>
                  {x[0]} • {x[1]}
                </small>
              </span>
              <em>{x[3]}</em>
              <strong>{x[4]}</strong>
              <span>
                <small>Responsable</small>
                <b>{x[5]}</b>
              </span>
              <time>{x[6]}</time>
              <button onClick={() => notify("Réclamation et actions ouvertes")}>
                ›
              </button>
            </article>
          ))}
        </section>
      )}
      {tab === "Revues de clôture" && (
        <section className="panel closure-register">
          <Head
            title="Revues de clôture"
            text="Résultat, rentabilité, satisfaction, savoir capitalisé et améliorations."
            action="Ce trimestre"
          />
          {[
            [
              "IL-2026-0038",
              "Négociation contrat distribution",
              "Société Safir",
              "S. Benali",
              "Complète",
              "9/10",
              "12,4 %",
            ],
            [
              "IL-2026-0031",
              "Conseil restructuration sociale",
              "Industries Nour",
              "N. El Idrissi",
              "À compléter",
              "—",
              "8,2 %",
            ],
            [
              "IL-2026-0027",
              "Recouvrement portefeuille Sud",
              "Atlas Services",
              "M. Alaoui",
              "Complète",
              "8/10",
              "15,8 %",
            ],
            [
              "IL-2026-0022",
              "Acquisition participation minoritaire",
              "Horizon Capital",
              "Y. Amrani",
              "Planifiée",
              "—",
              "18,1 %",
            ],
          ].map((x, i) => (
            <article className="closure-row" key={x[0]}>
              <span>
                <b>{x[1]}</b>
                <small>
                  {x[0]} • {x[2]}
                </small>
              </span>
              <span>
                <small>Responsable</small>
                <b>{x[3]}</b>
              </span>
              <i className={`closure-status cs${i}`}>{x[4]}</i>
              <span>
                <small>Satisfaction</small>
                <b>{x[5]}</b>
              </span>
              <span>
                <small>Marge</small>
                <b>{x[6]}</b>
              </span>
              <button onClick={() => notify("Revue de clôture ouverte")}>
                Ouvrir ›
              </button>
            </article>
          ))}
        </section>
      )}
      {modal && (
        <ComplaintModal close={() => setModal(false)} notify={notify} />
      )}
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
    <div className="quality-title">
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
function ComplaintModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal complaint-modal">
        <div className="modal-head">
          <div>
            <span>QUALITÉ CLIENT</span>
            <h2>Enregistrer une réclamation</h2>
            <p>
              Accusé de réception, responsable et délai de réponse seront
              suivis.
            </p>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="complaint-form">
          <label>
            Client
            <select>
              <option>Horizon Capital</option>
              <option>Société Atlas</option>
              <option>Groupe Andalous</option>
            </select>
          </label>
          <label>
            Dossier
            <select>
              <option>IL-2026-0064</option>
              <option>IL-2026-0091</option>
              <option>IL-2026-0087</option>
            </select>
          </label>
          <label className="wide">
            Objet
            <input placeholder="Objet précis de la réclamation" />
          </label>
          <label>
            Niveau
            <select>
              <option>Faible</option>
              <option>Moyen</option>
              <option>Élevé</option>
              <option>Critique</option>
            </select>
          </label>
          <label>
            Responsable
            <select>
              <option>Sara Benali</option>
              <option>Nadia El Idrissi</option>
              <option>Responsable qualité</option>
            </select>
          </label>
          <label className="wide">
            Description
            <textarea placeholder="Faits, attente du client et première mesure prise…" />
          </label>
          <label className="wide consent">
            <input type="checkbox" defaultChecked /> Envoyer immédiatement un
            accusé de réception au client
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            Annuler
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Réclamation enregistrée — accusé envoyé");
              close();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
