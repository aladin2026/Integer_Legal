"use client";
import { useState } from "react";

const leads = [
  [
    "Nouvelle sollicitation",
    "6",
    [
      [
        "Nova Industries",
        "Contentieux social",
        "120 000 DH",
        "Aujourd’hui",
        "NI",
      ],
      ["Fondation Al Amal", "Conseil gouvernance", "75 000 DH", "Hier", "FA"],
    ],
  ],
  [
    "Conflits & conformité",
    "3",
    [
      [
        "Groupe Zellige",
        "Acquisition immobilière",
        "240 000 DH",
        "Contrôle en cours",
        "GZ",
      ],
      [
        "Union Médicale",
        "Droit réglementaire",
        "95 000 DH",
        "Pièces KYC requises",
        "UM",
      ],
    ],
  ],
  [
    "Proposition envoyée",
    "4",
    [
      [
        "Maghreb Renewables",
        "Financement de projet",
        "310 000 DH",
        "Relance le 3 août",
        "MR",
      ],
      [
        "Riad Hospitality",
        "Restructuration",
        "180 000 DH",
        "Ouverte par le client",
        "RH",
      ],
    ],
  ],
  [
    "Gagnée / ouverture",
    "2",
    [
      [
        "Atlas Logistics",
        "Recouvrement portefeuille",
        "160 000 DH",
        "Lettre signée",
        "AL",
      ],
      [
        "Karim & Associés",
        "Propriété intellectuelle",
        "85 000 DH",
        "Acompte reçu",
        "KA",
      ],
    ],
  ],
] as const;

export function RelationshipManagement({
  notify,
}: {
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("Pipeline"),
    [modal, setModal] = useState(false);
  return (
    <div className="relationship-management">
      <div className="relationship-tabs">
        {["Pipeline", "Relations", "Propositions", "Origines"].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="relationship-kpis">
        {[
          ["Sollicitations actives", "15", "+4 ce mois"],
          ["Valeur pondérée", "1,24 M DH", "Honoraires potentiels"],
          ["Taux de conversion", "38 %", "+5 pts sur 90 jours"],
          ["Délai moyen", "9 jours", "Contact → convention"],
          ["Conflits en attente", "3", "Avant proposition"],
        ].map((x, i) => (
          <article className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 4 ? "warn" : ""}>{x[2]}</small>
          </article>
        ))}
      </div>
      {tab === "Pipeline" && (
        <>
          <Head
            title="Pipeline des nouvelles affaires"
            text="Du premier contact à l’ouverture du dossier, sans contourner l’acceptation."
          >
            <button
              className="secondary"
              onClick={() => notify("Filtres Responsable & domaine ouverts")}
            >
              ⌁ Responsable & domaine
            </button>
            <button className="primary" onClick={() => setModal(true)}>
              ＋ Nouvelle sollicitation
            </button>
          </Head>
          <div className="relationship-board">
            {leads.map((s, si) => (
              <section className="relationship-stage" key={s[0]}>
                <header>
                  <i className={`stage-dot s${si}`} />
                  <b>{s[0]}</b>
                  <em>{s[1]}</em>
                </header>
                {s[2].map((x, i) => (
                  <article className="lead-card" key={x[0]}>
                    <div>
                      <span className={`lead-logo l${si}`}>{x[4]}</span>
                      <i>{i ? "Standard" : "Prioritaire"}</i>
                    </div>
                    <h3>{x[0]}</h3>
                    <p>{x[1]}</p>
                    <strong>{x[2]}</strong>
                    <footer>
                      <span>◷ {x[3]}</span>
                      <button
                        onClick={() => notify("Fiche de sollicitation ouverte")}
                      >
                        ›
                      </button>
                    </footer>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </>
      )}
      {tab === "Relations" && (
        <div className="relationship-layout">
          <section className="panel relationship-list">
            <Title
              title="Relations clés"
              text="Clients, prospects, prescripteurs et partenaires."
            />
            {[
              [
                "SA",
                "Société Atlas",
                "Client stratégique",
                "S. Benali",
                "Prochain contact : 4 août",
              ],
              [
                "MR",
                "Maghreb Renewables",
                "Prospect prioritaire",
                "Y. Amrani",
                "Proposition en revue",
              ],
              [
                "KB",
                "Khalid Berrada",
                "Prescripteur — Expert-comptable",
                "S. Benali",
                "8 recommandations",
              ],
              [
                "BC",
                "Banque Centrale d’Affaires",
                "Partenaire",
                "N. El Idrissi",
                "3 dossiers communs",
              ],
            ].map((x, i) => (
              <button
                className="relationship-row"
                key={x[1]}
                onClick={() => notify("Historique de la relation ouvert")}
              >
                <span className={`lead-logo l${i}`}>{x[0]}</span>
                <span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </span>
                <span>
                  <small>Responsable</small>
                  <b>{x[3]}</b>
                </span>
                <span>
                  <small>Suivi</small>
                  <b>{x[4]}</b>
                </span>
                <em>›</em>
              </button>
            ))}
          </section>
          <aside className="panel relationship-agenda">
            <span>PROCHAINES ACTIONS</span>
            {[
              ["Aujourd’hui", "Appeler Maghreb Renewables", "Y. Amrani"],
              ["03 août", "Relancer Riad Hospitality", "M. Alaoui"],
              ["04 août", "Revue relation Société Atlas", "S. Benali"],
              ["12 août", "Déjeuner avec K. Berrada", "S. Benali"],
            ].map((x) => (
              <div key={x[1]}>
                <time>{x[0]}</time>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
            ))}
          </aside>
        </div>
      )}
      {tab === "Propositions" && (
        <section className="panel proposal-list">
          <Head
            title="Propositions d’honoraires"
            text="Versions, validations internes, envoi sécurisé et réponse du prospect."
          >
            <button
              className="primary"
              onClick={() => notify("Nouvelle proposition préparée")}
            >
              ＋ Préparer
            </button>
          </Head>
          <div className="proposal-row header">
            <span>Proposition</span>
            <span>Montant</span>
            <span>Responsable</span>
            <span>Activité</span>
            <span>Statut</span>
            <span />
          </div>
          {[
            [
              "PROP-0048 • Maghreb Renewables",
              "310 000 DH",
              "Y. Amrani",
              "Ouverte il y a 2 h",
              "En négociation",
            ],
            [
              "PROP-0047 • Riad Hospitality",
              "180 000 DH",
              "S. Benali",
              "Envoyée hier",
              "Envoyée",
            ],
            [
              "PROP-0046 • Atlas Logistics",
              "160 000 DH",
              "N. El Idrissi",
              "Signée le 30 juil.",
              "Acceptée",
            ],
            [
              "PROP-0045 • Union Médicale",
              "95 000 DH",
              "M. Alaoui",
              "Brouillon modifié",
              "Validation interne",
            ],
          ].map((x, i) => (
            <div className="proposal-row" key={x[0]}>
              <b>{x[0]}</b>
              <strong>{x[1]}</strong>
              <span>{x[2]}</span>
              <span>{x[3]}</span>
              <i className={`proposal-status ps${i}`}>{x[4]}</i>
              <button onClick={() => notify("Proposition ouverte")}>›</button>
            </div>
          ))}
        </section>
      )}
      {tab === "Origines" && (
        <div className="origin-layout">
          <section className="panel">
            <Title
              title="Origine des nouvelles affaires"
              text="Honoraires potentiels sur les douze derniers mois."
            />
            <div className="origin-chart">
              {[
                ["Recommandations clients", 42, "1,86 M DH"],
                ["Réseau professionnel", 27, "1,20 M DH"],
                ["Clients existants", 18, "0,80 M DH"],
                ["Site & événements", 9, "0,40 M DH"],
                ["Autres", 4, "0,18 M DH"],
              ].map((x, i) => (
                <div key={x[0] as string}>
                  <span>{x[0]}</span>
                  <div>
                    <i className={`o${i}`} style={{ width: `${x[1]}%` }} />
                  </div>
                  <b>{x[1]} %</b>
                  <strong>{x[2]}</strong>
                </div>
              ))}
            </div>
          </section>
          <aside className="panel referral-card">
            <span>PRESCRIPTEUR PRINCIPAL</span>
            <div className="lead-logo l2">KB</div>
            <h3>Khalid Berrada</h3>
            <p>Expert-comptable • Casablanca</p>
            <strong>8 recommandations</strong>
            <small>420 000 DH d’honoraires gagnés</small>
            <button onClick={() => notify("Plan de relation ouvert")}>
              Voir le plan de relation
            </button>
          </aside>
        </div>
      )}
      {modal && <LeadModal close={() => setModal(false)} notify={notify} />}
    </div>
  );
}
function Title({ title, text }: { title: string; text: string }) {
  return (
    <div className="relationship-head">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Head({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relationship-toolbar panel">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
function LeadModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="intake-modal lead-modal">
        <div className="modal-head">
          <div>
            <span>NOUVELLE AFFAIRE</span>
            <h2>Enregistrer une sollicitation</h2>
            <p>
              Aucun dossier n’est ouvert avant acceptation et contrôle des
              conflits.
            </p>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="lead-form">
          <label>
            Organisation / personne
            <input placeholder="Dénomination ou nom complet" />
          </label>
          <label>
            Contact principal
            <input placeholder="Nom et fonction" />
          </label>
          <label className="wide">
            Objet
            <textarea placeholder="Besoin exprimé, parties concernées et contexte…" />
          </label>
          <label>
            Domaine
            <select>
              <option>Contentieux commercial</option>
              <option>Corporate / M&A</option>
              <option>Droit social</option>
              <option>Fiscalité</option>
            </select>
          </label>
          <label>
            Associé responsable
            <select>
              <option>Sara Benali</option>
              <option>Nadia El Idrissi</option>
              <option>Youssef Amrani</option>
            </select>
          </label>
          <label>
            Source
            <select>
              <option>Recommandation client</option>
              <option>Réseau professionnel</option>
              <option>Client existant</option>
            </select>
          </label>
          <label>
            Honoraires estimés
            <input placeholder="Ex. 120 000 DH" />
          </label>
          <label className="wide consent">
            <input type="checkbox" defaultChecked /> Déclencher le contrôle de
            conflits et la collecte KYC
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            Annuler
          </button>
          <button
            className="primary"
            onClick={() => {
              notify("Sollicitation créée — contrôle de conflits déclenché");
              close();
            }}
          >
            Enregistrer et contrôler
          </button>
        </div>
      </div>
    </div>
  );
}
