"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { TeamDirectory } from "./team-directory";
import { SharedWorkQueue } from "./shared-work-queue";
import { CabinetBudgets } from "./budget-components";
import { FeeManagement } from "./financial-components";
import { CollectionsManagement } from "./collections-components";
import { TimeManagement } from "./time-components";
import { TaskManagement } from "./task-components";
import { RelationshipManagement } from "./relationship-components";
import { KnowledgeManagement } from "./knowledge-components";
import { ComplianceManagement } from "./compliance-components";
import { CommunicationManagement } from "./communication-components";
import { QualityManagement } from "./quality-components";
import { announceAction } from "./ui-actions";
import { legalApi, type Matter360 } from "./lib/legal-api";
import { authentication, type AuthenticationSnapshot } from "./lib/browser-auth";
import { LegalApiError } from "./lib/platform-auth";
import "./budgets.css";
import "./financial.css";
import "./collections.css";
import "./time.css";
import "./tasks.css";
import "./relationships.css";
import "./knowledge.css";
import "./compliance.css";
import "./communications.css";
import "./quality.css";
import "./notification-preferences.css";
import "./readability.css";
import "./api-states.css";

type Lang = "fr" | "ar" | "en";
type View =
  | "dashboard"
  | "quality"
  | "communications"
  | "compliance"
  | "knowledge"
  | "relationships"
  | "tasks"
  | "time"
  | "budgets"
  | "fees"
  | "collections"
  | "matters"
  | "conflicts"
  | "calendar"
  | "documents"
  | "clients"
  | "portal"
  | "audit"
  | "team"
  | "reports"
  | "settings";

const copy = {
  fr: {
    search: "Rechercher un dossier, un client, une partie…",
    today: "Aujourd’hui",
    greeting: "Bonjour, Maître Benali",
    subtitle: "Voici les priorités de votre cabinet pour aujourd’hui.",
    action: "Nouveau dossier",
    urgent: "Échéances urgentes",
    urgentHint: "3 nécessitent votre validation",
    active: "Dossiers actifs",
    activeHint: "+4 ce mois-ci",
    unbilled: "Temps non facturé",
    unbilledHint: "42 h à valider",
    collection: "Encaissement",
    collectionHint: "87 % sur 90 jours",
    deadlines: "Échéances prioritaires",
    seeAll: "Voir tout",
    activity: "Activité récente",
    workload: "Charge de l’équipe",
    revenue: "Honoraires & encaissements",
    matters: "Dossiers",
    conflicts: "Conflits",
    calendar: "Agenda",
    documents: "Documents",
    clients: "Clients",
    dashboard: "Pilotage",
    team: "Équipe",
    reports: "Rapports",
    quality: "Qualité",
    communications: "Communications",
    compliance: "Conformité",
    knowledge: "Savoir",
    relationships: "Développement",
    tasks: "Tâches",
    time: "Temps",
    budgets: "Budgets",
    fees: "Honoraires",
    collections: "Encaissements",
    settings: "Paramètres",
    navActivity: "Activité juridique",
    navCabinet: "Cabinet & équipe",
    navFinance: "Finance & pilotage",
    navGovernance: "Gouvernance & confiance",
    demo: "Prototype v0.57 • Parcours de validation",
    status: "Cabinet opérationnel",
    risk: "Risque",
    owner: "Responsable",
    next: "Prochaine action",
    progress: "Avancement",
    open: "Ouvrir le dossier",
    matterTitle: "Portefeuille des dossiers",
    conflictTitle: "Contrôles de conflits",
    calendarTitle: "Agenda juridique",
    documentTitle: "Documents et pièces",
    clientTitle: "Clients et contacts",
    portal: "Portail client",
    audit: "Audit",
    portalTitle: "Portail client sécurisé",
    auditTitle: "Journal d’audit",
    tour: "Visite guidée",
    add: "Ajouter",
    filter: "Filtrer",
    recent: "Mis à jour récemment",
    quickAccess: "Accès rapide",
    quickHint: "Vos espaces essentiels en un clic",
    recentlyViewed: "Consulté récemment",
    manageFavorites: "Personnaliser",
    favoriteTitle: "Mes modules favoris",
    favoriteHint:
      "Sélectionnez jusqu’à 5 modules à afficher sur le tableau de bord.",
    done: "Terminer",
    workQueue: "File de travail du jour",
    workQueueHint: "Toutes vos actions prioritaires réunies",
    all: "Toutes",
    approvals: "Validations",
    complete: "Terminer",
    noWork: "Aucune action dans cette catégorie",
    myDay: "Ma journée",
    firmView: "Vue cabinet",
    delegated: "Action réaffectée et collaborateur notifié",
    resetQueue: "Restaurer",
  },
  en: {
    search: "Search a matter, client or party…",
    today: "Today",
    greeting: "Good morning, Counsel Benali",
    subtitle: "Here are your firm’s priorities for today.",
    action: "New matter",
    urgent: "Urgent deadlines",
    urgentHint: "3 require validation",
    active: "Active matters",
    activeHint: "+4 this month",
    unbilled: "Unbilled time",
    unbilledHint: "42 h to approve",
    collection: "Collections",
    collectionHint: "87% over 90 days",
    deadlines: "Priority deadlines",
    seeAll: "View all",
    activity: "Recent activity",
    workload: "Team workload",
    revenue: "Fees & collections",
    matters: "Matters",
    conflicts: "Conflicts",
    calendar: "Calendar",
    documents: "Documents",
    clients: "Clients",
    dashboard: "Steering",
    team: "Team",
    reports: "Reports",
    quality: "Quality",
    communications: "Communications",
    compliance: "Compliance",
    knowledge: "Knowledge",
    relationships: "Business development",
    tasks: "Tasks",
    time: "Time",
    budgets: "Budgets",
    fees: "Fees",
    collections: "Collections",
    settings: "Settings",
    navActivity: "Legal work",
    navCabinet: "Firm & team",
    navFinance: "Finance & steering",
    navGovernance: "Governance & trust",
    demo: "Prototype v0.57 • Validation workflow",
    status: "Firm operational",
    risk: "Risk",
    owner: "Owner",
    next: "Next action",
    progress: "Progress",
    open: "Open matter",
    matterTitle: "Matter portfolio",
    conflictTitle: "Conflict checks",
    calendarTitle: "Legal calendar",
    documentTitle: "Documents & evidence",
    clientTitle: "Clients & contacts",
    portal: "Client portal",
    audit: "Audit",
    portalTitle: "Secure client portal",
    auditTitle: "Audit trail",
    tour: "Guided tour",
    add: "Add",
    filter: "Filter",
    recent: "Recently updated",
    quickAccess: "Quick access",
    quickHint: "Your essential spaces in one click",
    recentlyViewed: "Recently viewed",
    manageFavorites: "Customize",
    favoriteTitle: "My favorite modules",
    favoriteHint: "Select up to 5 modules to display on the dashboard.",
    done: "Done",
    workQueue: "Today’s work queue",
    workQueueHint: "All your priority actions in one place",
    all: "All",
    approvals: "Approvals",
    complete: "Complete",
    noWork: "No action in this category",
    myDay: "My day",
    firmView: "Firm view",
    delegated: "Action reassigned and team member notified",
    resetQueue: "Restore",
  },
  ar: {
    search: "البحث عن ملف أو موكل أو طرف…",
    today: "اليوم",
    greeting: "مرحباً، الأستاذ بنعلي",
    subtitle: "هذه أهم أولويات المكتب لهذا اليوم.",
    action: "فتح ملف جديد",
    urgent: "الآجال المستعجلة",
    urgentHint: "3 تتطلب المصادقة",
    active: "الملفات النشطة",
    activeHint: "+4 هذا الشهر",
    unbilled: "ساعات غير مفوترة",
    unbilledHint: "42 ساعة للمراجعة",
    collection: "التحصيل",
    collectionHint: "87٪ خلال 90 يوماً",
    deadlines: "الآجال ذات الأولوية",
    seeAll: "عرض الكل",
    activity: "آخر الأنشطة",
    workload: "عبء عمل الفريق",
    revenue: "الأتعاب والتحصيل",
    matters: "الملفات",
    conflicts: "تعارض المصالح",
    calendar: "الأجندة",
    documents: "الوثائق",
    clients: "الموكلون",
    dashboard: "القيادة",
    team: "الفريق",
    reports: "التقارير",
    quality: "الجودة",
    communications: "الاتصالات",
    compliance: "الامتثال",
    knowledge: "المعرفة",
    relationships: "تطوير الأعمال",
    tasks: "المهام",
    time: "الوقت",
    budgets: "الميزانيات",
    fees: "الأتعاب",
    collections: "التحصيل",
    settings: "الإعدادات",
    navActivity: "العمل القانوني",
    navCabinet: "المكتب والفريق",
    navFinance: "المالية والقيادة",
    navGovernance: "الحوكمة والثقة",
    demo: "النموذج v0.57 • مسار المصادقة",
    status: "المكتب يعمل بشكل طبيعي",
    risk: "المخاطر",
    owner: "المسؤول",
    next: "الإجراء التالي",
    progress: "التقدم",
    open: "فتح الملف",
    matterTitle: "محفظة الملفات",
    conflictTitle: "فحص تعارض المصالح",
    calendarTitle: "الأجندة القانونية",
    documentTitle: "الوثائق والمستندات",
    clientTitle: "الموكلون وجهات الاتصال",
    portal: "بوابة الموكل",
    audit: "سجل التدقيق",
    portalTitle: "بوابة الموكل الآمنة",
    auditTitle: "سجل العمليات",
    tour: "جولة إرشادية",
    add: "إضافة",
    filter: "تصفية",
    recent: "تم التحديث مؤخراً",
    quickAccess: "وصول سريع",
    quickHint: "مساحاتك الأساسية بنقرة واحدة",
    recentlyViewed: "تمت زيارته مؤخراً",
    manageFavorites: "تخصيص",
    favoriteTitle: "وحداتي المفضلة",
    favoriteHint: "اختر حتى 5 وحدات لعرضها على لوحة القيادة.",
    done: "تم",
    workQueue: "قائمة عمل اليوم",
    workQueueHint: "جميع إجراءاتك ذات الأولوية في مكان واحد",
    all: "الكل",
    approvals: "المصادقات",
    complete: "إنهاء",
    noWork: "لا توجد إجراءات في هذه الفئة",
    myDay: "يومي",
    firmView: "نظرة المكتب",
    delegated: "تمت إعادة إسناد الإجراء وإشعار عضو الفريق",
    resetQueue: "استعادة",
  },
};
type TCopy = Record<keyof typeof copy.fr, string>;

const deadlineTemplates = [
  {
    offsetDays: 0,
    time: "09:30",
    title: "Audience — Société Atlas c/ Maroc Distribution",
    meta: "Tribunal de commerce • Salle 4",
    tone: "red",
  },
  {
    offsetDays: 1,
    time: "16:00",
    title: "Dépôt du mémoire en réponse",
    meta: "Dossier IL-2026-0087 • Cour d’appel",
    tone: "amber",
  },
  {
    offsetDays: 4,
    time: "12:00",
    title: "Validation du projet de transaction",
    meta: "Dossier IL-2026-0064 • Client en attente",
    tone: "blue",
  },
];

function getDeadlines(lang: Lang, baseDate: Date) {
  const locale = lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-MA";
  return deadlineTemplates.map((deadline) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + deadline.offsetDays);
    return {
      ...deadline,
      date,
      day: new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        timeZone: "Africa/Casablanca",
      }).format(date),
      month: new Intl.DateTimeFormat(locale, {
        month: "short",
        timeZone: "Africa/Casablanca",
      })
        .format(date)
        .replace(".", "")
        .toLocaleUpperCase(locale),
    };
  });
}

type MatterCard = {
  id?: string;
  ref: string;
  name: string;
  client: string;
  type: string;
  owner: string;
  risk: string;
  next: string;
  progress: number;
};

const matters: MatterCard[] = [
  {
    ref: "IL-2026-0091",
    name: "Atlas c/ Maroc Distribution",
    client: "Société Atlas",
    type: "Contentieux commercial",
    owner: "S. Benali",
    risk: "Élevé",
    next: "Audience demain",
    progress: 72,
  },
  {
    ref: "IL-2026-0087",
    name: "Restructuration groupe Andalous",
    client: "Groupe Andalous",
    type: "Conseil corporate",
    owner: "N. El Idrissi",
    risk: "Moyen",
    next: "Mémoire le 2 août",
    progress: 58,
  },
  {
    ref: "IL-2026-0064",
    name: "Projet Horizon — acquisition",
    client: "Horizon Capital",
    type: "M&A",
    owner: "Y. Amrani",
    risk: "Faible",
    next: "Validation client",
    progress: 84,
  },
  {
    ref: "IL-2026-0042",
    name: "Recouvrement créances Nord",
    client: "Logis Nord",
    type: "Recouvrement",
    owner: "M. Alaoui",
    risk: "Moyen",
    next: "Relance le 6 août",
    progress: 43,
  },
];

const nav: {
  id: View;
  icon: string;
  fresh?: boolean;
  section?: "navActivity" | "navCabinet" | "navFinance" | "navGovernance";
}[] = [
  { id: "dashboard", icon: "⌂", section: "navActivity" },
  { id: "matters", icon: "▣" },
  { id: "clients", icon: "♙" },
  { id: "relationships", icon: "♢", fresh: true },
  { id: "conflicts", icon: "◇" },
  { id: "calendar", icon: "□" },
  { id: "communications", icon: "✉", fresh: true },
  { id: "documents", icon: "▤" },
  { id: "knowledge", icon: "◆", fresh: true },
  { id: "team", icon: "♙", fresh: true, section: "navCabinet" },
  { id: "tasks", icon: "✓", fresh: true },
  { id: "time", icon: "◴", fresh: true },
  { id: "budgets", icon: "◫", fresh: true, section: "navFinance" },
  { id: "fees", icon: "◷", fresh: true },
  { id: "collections", icon: "↗", fresh: true },
  { id: "reports", icon: "▥", fresh: true },
  { id: "quality", icon: "☆", fresh: true, section: "navGovernance" },
  { id: "compliance", icon: "⬡", fresh: true },
  { id: "portal", icon: "◎", fresh: true },
  { id: "audit", icon: "◉", fresh: true },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [view, setView] = useState<View>("dashboard");
  const [notice, setNotice] = useState("");
  const [actionDetail, setActionDetail] = useState("");
  const [query, setQuery] = useState("");
  const [liveMatters, setLiveMatters] = useState<MatterCard[]>([]);
  const [apiState, setApiState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [apiMessage, setApiMessage] = useState("");
  const [auth, setAuth] = useState<AuthenticationSnapshot>({ status: "loading" });
  const [selectedMatter, setSelectedMatter] = useState<
    (typeof matters)[number] | null
  >(null);
  const [showIntake, setShowIntake] = useState(false);
  const [documentModal, setDocumentModal] = useState<"add" | "detail" | null>(
    null,
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [recentViews, setRecentViews] = useState<View[]>([
    "matters",
    "calendar",
    "budgets",
  ]);
  const [favoriteViews, setFavoriteViews] = useState<View[]>(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? window.localStorage.getItem("integer-legal-favorites")
          : null;
      return saved
        ? JSON.parse(saved)
        : ["matters", "calendar", "budgets", "team", "reports"];
    } catch {
      return ["matters", "calendar", "budgets", "team", "reports"];
    }
  });
  const t = copy[lang];
  const rtl = lang === "ar";
  const filtered = useMemo(
    () => {
      const productMatters = apiState === "ready" ? liveMatters : [];
      return productMatters.filter((m) =>
        `${m.ref} ${m.name} ${m.client}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      );
    },
    [apiState, liveMatters, query],
  );
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2300);
  };
  useEffect(() => {
    const handleAction = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (message) {
        setActionDetail(message);
      }
    };
    window.addEventListener("integer-action", handleAction);
    return () => window.removeEventListener("integer-action", handleAction);
  }, []);
  useEffect(() => {
    const unsubscribe = authentication.subscribe(setAuth);
    void authentication.initialize();
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (auth.status !== "authenticated") {
      setApiState(auth.status === "loading" ? "loading" : "empty");
      setApiMessage(auth.message ?? "");
      return;
    }
    const controller = new AbortController();
    legalApi.listMatters(controller.signal).then((items) => {
      const mapped = items.map<MatterCard>((item) => ({
        id: item.id,
        ref: item.reference,
        name: item.title,
        client: item.clientName,
        type: statusLabel(item.status, lang),
        owner: item.responsibleUserId.slice(0, 8),
        risk: lang === "ar" ? "غير محدد" : lang === "en" ? "Not set" : "Non défini",
        next: new Intl.DateTimeFormat(lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-MA", { dateStyle: "medium" }).format(new Date(item.createdAt)),
        progress: item.status === 1 ? 50 : item.status > 1 ? 100 : 10,
      }));
      setLiveMatters(mapped);
      setApiState(mapped.length ? "ready" : "empty");
      setApiMessage("");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setApiState("error");
      setApiMessage(apiErrorMessage(error, lang));
    });
    return () => controller.abort();
  }, [auth.status, auth.message, lang]);
  const markNotificationsRead = (message: string) => {
    window.dispatchEvent(new Event("integer-notifications-read"));
    notify(message);
  };
  const navigate = (nextView: View) => {
    setView(nextView);
    setSelectedMatter(null);
    if (nextView !== "dashboard" && nextView !== "settings")
      setRecentViews((current) =>
        [nextView, ...current.filter((item) => item !== nextView)].slice(0, 3),
      );
  };
  const toggleFavorite = (nextView: View) =>
    setFavoriteViews((current) => {
      const updated = current.includes(nextView)
        ? current.filter((item) => item !== nextView)
        : current.length < 5
          ? [...current, nextView]
          : current;
      try {
        window.localStorage.setItem(
          "integer-legal-favorites",
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

  return (
    <main className="app-shell" dir={rtl ? "rtl" : "ltr"} lang={lang}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">IL</div>
          <div>
            <strong>INTEGER</strong>
            <span>LEGAL</span>
          </div>
        </div>
        <div className="workspace">
          <span>CB</span>
          <div>
            <b>Cabinet Benali</b>
            <small>Casablanca</small>
          </div>
          <i>⌄</i>
        </div>
        <nav>
          {nav.map((item) => (
            <Fragment key={item.id}>
              {item.section && (
                <span className="nav-section">{t[item.section]}</span>
              )}
              <button
                className={view === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <i>{item.icon}</i>
                <span>{t[item.id]}</span>
                {item.fresh && (
                  <em>
                    {lang === "fr" ? "Nouveau" : lang === "en" ? "New" : "جديد"}
                  </em>
                )}
              </button>
            </Fragment>
          ))}
          <div className="nav-rule" />
          <button
            className={view === "settings" ? "active" : ""}
            onClick={() => navigate("settings")}
          >
            <i>⚙</i>
            <span>{t.settings}</span>
          </button>
        </nav>
        <div className="sidebar-foot">
          <div className="status-dot" /> <span>{t.status}</span>
          <small>{t.demo}</small>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
            />
            {query && <button onClick={() => setQuery("")}>×</button>}
          </label>
          <div className="top-actions">
            <button className="tour-button" onClick={() => void (auth.status === "authenticated" ? authentication.signOut() : authentication.signIn())}>
              {auth.status === "authenticated"
                ? (lang === "ar" ? "تسجيل الخروج" : lang === "en" ? "Sign out" : "Déconnexion")
                : (lang === "ar" ? "تسجيل الدخول" : lang === "en" ? "Sign in" : "Connexion")}
            </button>
            <button className="tour-button" onClick={() => setTourStep(1)}>
              ▷ {t.tour}
            </button>
            <button className="quick-button" onClick={() => setQuickOpen(true)}>
              ＋
            </button>
            <div className="language-switch">
              {(["fr", "ar", "en"] as Lang[]).map((l) => (
                <button
                  className={lang === l ? "selected" : ""}
                  onClick={() => setLang(l)}
                  key={l}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <TaskNotificationButton
              open={notificationsOpen}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            />
            <div className="avatar">SB</div>
          </div>
        </header>

        <div className="content">
          {apiState !== "ready" && (
            <DataState state={apiState} message={apiMessage} lang={lang} />
          )}
          {selectedMatter ? (
            <MatterDetail
              matter={selectedMatter}
              onBack={() => setSelectedMatter(null)}
              notify={notify}
            />
          ) : view === "dashboard" ? (
            <Dashboard
              lang={lang}
              t={t}
              notify={notify}
              filtered={filtered}
              onOpen={setSelectedMatter}
              onNew={() => setShowIntake(true)}
              onNavigate={navigate}
              recentViews={recentViews}
              favoriteViews={favoriteViews}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <ModuleView
              view={view}
              t={t}
              lang={lang}
              filtered={filtered}
              notify={notify}
              onOpen={setSelectedMatter}
              onDocument={(mode) => setDocumentModal(mode)}
            />
          )}
        </div>
      </section>
      {showIntake && (
        <IntakeModal onClose={() => setShowIntake(false)} notify={notify} />
      )}
      {documentModal && (
        <DocumentModal
          mode={documentModal}
          onClose={() => setDocumentModal(null)}
          notify={notify}
        />
      )}
      {query && (
        <GlobalSearch
          query={query}
          onClose={() => setQuery("")}
          onOpen={(m) => {
            setSelectedMatter(m);
            setQuery("");
          }}
        />
      )}
      {notificationsOpen && (
        <NotificationCenter
          lang={lang}
          onClose={() => setNotificationsOpen(false)}
          notify={markNotificationsRead}
          onNavigate={(next) => {
            navigate(next);
            setNotificationsOpen(false);
          }}
        />
      )}
      {quickOpen && (
        <QuickActions
          onClose={() => setQuickOpen(false)}
          onIntake={() => {
            setQuickOpen(false);
            setShowIntake(true);
          }}
          onDocument={() => {
            setQuickOpen(false);
            setDocumentModal("add");
          }}
          notify={notify}
        />
      )}
      {tourStep > 0 && (
        <GuidedTour
          step={tourStep}
          onStep={setTourStep}
          onNavigate={navigate}
        />
      )}
      {actionDetail && (
        <ActionDetailModal
          detail={actionDetail}
          onClose={() => setActionDetail("")}
        />
      )}
      {notice && <div className="toast">✓ {notice}</div>}
    </main>
  );
}

function statusLabel(status: number, lang: Lang) {
  const labels = lang === "ar" ? ["مسودة", "نشط", "مغلق"] : lang === "en" ? ["Draft", "Active", "Closed"] : ["Brouillon", "Actif", "Clôturé"];
  return labels[Math.min(Math.max(status, 0), labels.length - 1)] ?? String(status);
}

function apiErrorMessage(error: unknown, lang: Lang) {
  const code = error instanceof LegalApiError ? error.code : "api_error";
  const messages = {
    fr: { platform_unavailable: "Connexion Integer Platform indisponible.", authentication_required: "Authentification requise.", access_denied: "Accès non autorisé pour ce rôle.", configuration_missing: "Adresse de l’API Legal non configurée.", api_error: "Impossible de charger les données Legal." },
    en: { platform_unavailable: "Integer Platform connection is unavailable.", authentication_required: "Authentication is required.", access_denied: "This role is not authorized.", configuration_missing: "The Legal API URL is not configured.", api_error: "Legal data could not be loaded." },
    ar: { platform_unavailable: "الاتصال بمنصة Integer غير متاح.", authentication_required: "المصادقة مطلوبة.", access_denied: "هذا الدور غير مخول.", configuration_missing: "عنوان واجهة Legal غير مضبوط.", api_error: "تعذر تحميل البيانات القانونية." },
  } as const;
  return messages[lang][code as keyof typeof messages.fr] ?? messages[lang].api_error;
}

function DataState({ state, message, lang }: { state: "loading" | "ready" | "empty" | "error"; message: string; lang: Lang }) {
  if (state === "ready") return null;
  const loading = lang === "ar" ? "جارٍ تحميل بيانات المكتب…" : lang === "en" ? "Loading firm data…" : "Chargement des données du cabinet…";
  const empty = lang === "ar" ? "لا توجد ملفات بعد." : lang === "en" ? "No matters yet." : "Aucun dossier pour le moment.";
  return <div className={`data-state ${state}`} role={state === "error" ? "alert" : "status"}>{state === "loading" ? loading : state === "empty" ? empty : message}</div>;
}

function Dashboard({
  lang,
  t,
  notify,
  filtered,
  onOpen,
  onNew,
  onNavigate,
  recentViews,
  favoriteViews,
  onToggleFavorite,
}: {
  lang: Lang;
  t: TCopy;
  notify: (x: string) => void;
  filtered: typeof matters;
  onOpen: (m: (typeof matters)[number]) => void;
  onNew: () => void;
  onNavigate: (view: View) => void;
  recentViews: View[];
  favoriteViews: View[];
  onToggleFavorite: (view: View) => void;
}) {
  const [manageFavorites, setManageFavorites] = useState(false);
  const [allDeadlinesOpen, setAllDeadlinesOpen] = useState(false);
  const [dashboardPanel, setDashboardPanel] = useState<
    "activity" | "workload" | null
  >(null);
  const [selectedKpi, setSelectedKpi] = useState<
    "urgent" | "active" | "unbilled" | "performance" | null
  >(null);
  const [urgentDeadlineValidated, setUrgentDeadlineValidated] = useState(false);
  const [scope, setScope] = useState<"mine" | "firm">("mine");
  const [currentDate] = useState(() => new Date());
  const dateLabel = new Intl.DateTimeFormat(
    lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-MA",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Casablanca",
    },
  ).format(currentDate);
  const dashboardDeadlines = getDeadlines(lang, currentDate);
  const available: { id: View; icon: string }[] = nav
    .filter((item) => !["dashboard", "portal", "audit"].includes(item.id))
    .map((item) => ({ id: item.id, icon: item.icon }));
  const shortcuts = favoriteViews
    .map((id) => available.find((item) => item.id === id))
    .filter((item): item is { id: View; icon: string } => Boolean(item));
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">
            {t.today} • {dateLabel}
          </div>
          <h1>{t.greeting}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="dashboard-actions">
          <div className="scope-switch">
            <button
              className={scope === "mine" ? "active" : ""}
              onClick={() => setScope("mine")}
            >
              ♙ {t.myDay}
            </button>
            <button
              className={scope === "firm" ? "active" : ""}
              onClick={() => setScope("firm")}
            >
              ▦ {t.firmView}
            </button>
          </div>
          <button className="primary" onClick={onNew}>
            ＋ {t.action}
          </button>
        </div>
      </div>
      <section className="quick-access panel">
        <div className="quick-access-title">
          <div>
            <h2>{t.quickAccess}</h2>
            <p>{t.quickHint}</p>
          </div>
          <button onClick={() => setManageFavorites(true)}>
            ☆ {t.manageFavorites}
          </button>
        </div>
        <div className={`quick-access-links count-${shortcuts.length}`}>
          {shortcuts.map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)}>
              <i>{item.icon}</i>
              <span>{t[item.id]}</span>
              {recentViews.includes(item.id) && (
                <small>{t.recentlyViewed}</small>
              )}
              <b>›</b>
            </button>
          ))}
        </div>
      </section>
      {manageFavorites && (
        <div
          className="favorite-backdrop"
          onClick={() => setManageFavorites(false)}
        >
          <section
            className="favorite-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>INTEGER LEGAL</small>
                <h2>{t.favoriteTitle}</h2>
                <p>{t.favoriteHint}</p>
              </div>
              <button onClick={() => setManageFavorites(false)}>×</button>
            </header>
            <div className="favorite-grid">
              {available.map((item) => (
                <button
                  key={item.id}
                  className={favoriteViews.includes(item.id) ? "selected" : ""}
                  onClick={() => onToggleFavorite(item.id)}
                  disabled={
                    !favoriteViews.includes(item.id) &&
                    favoriteViews.length >= 5
                  }
                >
                  <i>{item.icon}</i>
                  <span>{t[item.id]}</span>
                  <b>{favoriteViews.includes(item.id) ? "★" : "☆"}</b>
                </button>
              ))}
            </div>
            <footer>
              <span>{favoriteViews.length}/5</span>
              <button
                className="primary"
                onClick={() => setManageFavorites(false)}
              >
                {t.done}
              </button>
            </footer>
          </section>
        </div>
      )}
      <section className="kpis">
        <Kpi
          icon="!"
          tone="red"
          value={scope === "mine" ? "2" : "3"}
          label={t.urgent}
          hint={
            scope === "mine"
              ? urgentDeadlineValidated
                ? "Toutes les validations sont acquittées"
                : "1 nécessite votre validation"
              : t.urgentHint
          }
          onClick={() => setSelectedKpi("urgent")}
        />
        <Kpi
          icon="▣"
          tone="blue"
          value={scope === "mine" ? "9" : "28"}
          label={t.active}
          hint={scope === "mine" ? "3 actions aujourd’hui" : t.activeHint}
          onClick={() => setSelectedKpi("active")}
        />
        <Kpi
          icon="◷"
          tone="amber"
          value={scope === "mine" ? "18,5 h" : "126 400 DH"}
          label={t.unbilled}
          hint={scope === "mine" ? "À valider cette semaine" : t.unbilledHint}
          onClick={() => setSelectedKpi("unbilled")}
        />
        <Kpi
          icon="↗"
          tone="green"
          value={scope === "mine" ? "82%" : "87%"}
          label={scope === "mine" ? t.progress : t.collection}
          hint={scope === "mine" ? "Objectifs personnels" : t.collectionHint}
          onClick={() => setSelectedKpi("performance")}
        />
      </section>
      <WorkQueue
        lang={lang}
        t={t}
        notify={notify}
        onNavigate={onNavigate}
        scope={scope}
      />
      <section className="dashboard-grid">
        <div className="panel deadlines">
          <PanelTitle
            title={t.deadlines}
            action={t.seeAll}
            onAction={() => setAllDeadlinesOpen(true)}
          />
          {dashboardDeadlines.map((d, i) => (
            <div className="deadline" key={i}>
              <div className={`date ${d.tone}`}>
                <b>{d.day}</b>
                <small>{d.month}</small>
              </div>
              <div className="deadline-copy">
                <strong>{d.title}</strong>
                <span>{d.meta}</span>
              </div>
              <time>{d.time}</time>
              <button onClick={() => onOpen(matters[i])}>›</button>
            </div>
          ))}
        </div>
        <div className="panel activity">
          <PanelTitle
            title={t.activity}
            action={t.seeAll}
            onAction={() => setDashboardPanel("activity")}
          />
          <Timeline />
        </div>
        <div className="panel workload">
          <PanelTitle
            title={t.workload}
            action={t.seeAll}
            onAction={() => setDashboardPanel("workload")}
          />
          <Team />
        </div>
        <div className="panel revenue">
          <PanelTitle title={t.revenue} action="90 jours" />
          <Revenue />
        </div>
      </section>
      {filtered.length < matters.length && (
        <div className="panel search-results">
          <PanelTitle title={`${filtered.length} résultat(s)`} action="" />
          <MatterRows data={filtered} onOpen={onOpen} />
        </div>
      )}
      {allDeadlinesOpen && (
        <PriorityDeadlinesModal
          lang={lang}
          deadlines={dashboardDeadlines}
          onClose={() => setAllDeadlinesOpen(false)}
          onOpen={(matter) => {
            setAllDeadlinesOpen(false);
            onOpen(matter);
          }}
        />
      )}
      {dashboardPanel && (
        <DashboardPanelModal
          lang={lang}
          type={dashboardPanel}
          onClose={() => setDashboardPanel(null)}
          onOpenMatter={(matter) => {
            setDashboardPanel(null);
            onOpen(matter);
          }}
          onOpenTasks={() => {
            setDashboardPanel(null);
            onNavigate("tasks");
          }}
        />
      )}
      {selectedKpi && (
        <DashboardKpiModal
          type={selectedKpi}
          scope={scope}
          urgentValidated={urgentDeadlineValidated}
          onValidateUrgent={() => setUrgentDeadlineValidated(true)}
          onClose={() => setSelectedKpi(null)}
          onOpenMatter={(matter) => {
            setSelectedKpi(null);
            onOpen(matter);
          }}
          onNavigate={(nextView) => {
            setSelectedKpi(null);
            onNavigate(nextView);
          }}
        />
      )}
    </>
  );
}

function WorkQueue({
  lang,
  t,
  notify,
  onNavigate,
  scope,
}: {
  lang: Lang;
  t: TCopy;
  notify: (x: string) => void;
  onNavigate: (view: View) => void;
  scope: "mine" | "firm";
}) {
  return (
    <SharedWorkQueue
      lang={lang}
      t={t}
      notify={notify}
      scope={scope}
      onNavigate={(next) => onNavigate(next as View)}
    />
  );
}

function ModuleView({
  view,
  t,
  lang,
  filtered,
  notify,
  onOpen,
  onDocument,
}: {
  view: View;
  t: TCopy;
  lang: Lang;
  filtered: typeof matters;
  notify: (x: string) => void;
  onOpen: (m: (typeof matters)[number]) => void;
  onDocument: (mode: "add" | "detail") => void;
}) {
  const [taskCreateRequest, setTaskCreateRequest] = useState(0);
  const [clientCreateOpen, setClientCreateOpen] = useState(false);
  const [addedClients, setAddedClients] = useState<string[]>([]);
  const titles: Partial<Record<View, string>> = {
    matters: t.matterTitle,
    conflicts: t.conflictTitle,
    calendar: t.calendarTitle,
    quality: t.quality,
    communications: t.communications,
    documents: t.documentTitle,
    clients: t.clientTitle,
    compliance: t.compliance,
    knowledge: t.knowledge,
    relationships: t.relationships,
    portal: t.portalTitle,
    audit: t.auditTitle,
    team: t.team,
    tasks: t.tasks,
    time: t.time,
    budgets: t.budgets,
    fees: t.fees,
    collections: t.collections,
    reports: t.reports,
    settings: t.settings,
  };
  return (
    <>
      <div className="page-head compact">
        <div>
          <div className="eyebrow">INTEGER LEGAL</div>
          <h1>{titles[view]}</h1>
          <p>{t.recent}</p>
        </div>
        <div className="head-buttons">
          <button
            className="secondary"
            onClick={() => announceAction(`${t.filter} — options affichées`)}
          >
            ⌁ {t.filter}
          </button>
          <button
            className="primary"
            onClick={() =>
              view === "tasks"
                ? setTaskCreateRequest((request) => request + 1)
                : view === "clients"
                  ? setClientCreateOpen(true)
                  : notify(`${t.add} — ${titles[view]}`)
            }
          >
            ＋ {t.add}
          </button>
        </div>
      </div>
      {view === "matters" && (
        <div className="panel table-panel">
          <MatterRows data={filtered} onOpen={onOpen} />
        </div>
      )}
      {view === "conflicts" && <ConflictView notify={notify} />}{" "}
      {view === "relationships" && <RelationshipManagement notify={notify} />}{" "}
      {view === "knowledge" && <KnowledgeManagement notify={notify} />}{" "}
      {view === "compliance" && <ComplianceManagement notify={notify} />}{" "}
      {view === "communications" && <CommunicationManagement notify={notify} />}{" "}
      {view === "quality" && <QualityManagement notify={notify} />}{" "}
      {view === "calendar" && <CalendarView lang={lang} />}{" "}
      {view === "documents" && (
        <DocumentView
          onAdd={() => onDocument("add")}
          onOpen={() => onDocument("detail")}
        />
      )}{" "}
      {view === "clients" && <ClientView addedClients={addedClients} />}{" "}
      {clientCreateOpen && (
        <ClientCreateModal
          lang={lang}
          onClose={() => setClientCreateOpen(false)}
          onCreated={(name) => {
            setAddedClients((clients) => [name, ...clients]);
            notify(`${t.add} — ${name}`);
          }}
        />
      )}
      {view === "portal" && <PortalView notify={notify} />}{" "}
      {view === "audit" && <AuditView />}{" "}
      {view === "team" && (
        <>
          <TeamDirectory lang={lang} notify={notify} />
          <TeamManagement notify={notify} />
        </>
      )}{" "}
      {view === "tasks" && (
        <TaskManagement
          key={`tasks-${taskCreateRequest}`}
          notify={notify}
          lang={lang}
          openRequest={taskCreateRequest}
        />
      )}{" "}
      {view === "time" && <TimeManagement notify={notify} />}{" "}
      {view === "budgets" && <CabinetBudgets notify={notify} />}{" "}
      {view === "fees" && <FeeManagement notify={notify} />}{" "}
      {view === "collections" && <CollectionsManagement notify={notify} />}{" "}
      {view === "reports" && <ReportsView />}{" "}
      {view === "settings" && <GovernanceSettings notify={notify} />}
    </>
  );
}

function MatterRows({
  data,
  onOpen,
}: {
  data: typeof matters;
  onOpen: (m: (typeof matters)[number]) => void;
}) {
  return (
    <div className="matter-table">
      <div className="matter-row header">
        <span>Référence / dossier</span>
        <span>Client & domaine</span>
        <span>Responsable</span>
        <span>Risque</span>
        <span>Progression</span>
      </div>
      {data.map((m) => (
        <button
          className="matter-row matter-link"
          key={m.ref}
          onClick={() => onOpen(m)}
        >
          <span>
            <b>{m.name}</b>
            <small>{m.ref}</small>
          </span>
          <span>
            <b>{m.client}</b>
            <small>{m.type}</small>
          </span>
          <span>{m.owner}</span>
          <span>
            <i className={`badge ${m.risk}`}>{m.risk}</i>
            <small>{m.next}</small>
          </span>
          <span>
            <div className="progress">
              <i style={{ width: `${m.progress}%` }} />
            </div>
            <small>{m.progress}%</small>
          </span>
        </button>
      ))}
    </div>
  );
}
function Kpi({
  icon,
  tone,
  value,
  label,
  hint,
  onClick,
}: {
  icon: string;
  tone: string;
  value: string;
  label: string;
  hint: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="kpi" onClick={onClick}>
      <div className={`kpi-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      {onClick && <em>Voir les éléments concernés ›</em>}
    </button>
  );
}

function DashboardKpiModal({
  type,
  scope,
  onClose,
  onOpenMatter,
  onNavigate,
  urgentValidated,
  onValidateUrgent,
}: {
  type: "urgent" | "active" | "unbilled" | "performance";
  scope: "mine" | "firm";
  onClose: () => void;
  onOpenMatter: (matter: (typeof matters)[number]) => void;
  onNavigate: (view: View) => void;
  urgentValidated: boolean;
  onValidateUrgent: () => void;
}) {
  const personal = scope === "mine";
  const [validationOpen, setValidationOpen] = useState(false);
  const [agendaPreviewOpen, setAgendaPreviewOpen] = useState(false);
  const data = {
    urgent: {
      title: "Échéances urgentes",
      value: personal ? "2" : "3",
      hint: personal ? "Vos validations et audiences prioritaires" : "Échéances critiques du cabinet",
      target: "calendar" as View,
      targetLabel: "Ouvrir l’agenda complet",
      rows: [
        [
          "Audience — Société Atlas",
          "Aujourd’hui • 09:30",
          urgentValidated ? "Validée" : "Validation requise",
          0,
        ],
        ["Dépôt du mémoire Andalous", "Demain • 16:00", "À finaliser", 1],
        ["Transaction Horizon", "Dans 4 jours • 12:00", "Client en attente", 2],
      ],
    },
    active: {
      title: "Dossiers actifs",
      value: personal ? "9" : "28",
      hint: personal ? "Dossiers sous votre responsabilité" : "Portefeuille actif du cabinet",
      target: "matters" as View,
      targetLabel: "Voir tous les dossiers",
      rows: matters.map((matter, index) => [matter.name, matter.ref, `${matter.progress}% • ${matter.risk}`, index]),
    },
    unbilled: {
      title: personal ? "Temps non facturé" : "Production à facturer",
      value: personal ? "18,5 h" : "126 400 DH",
      hint: personal ? "Temps à contrôler avant validation" : "Production validée non préfacturée",
      target: "time" as View,
      targetLabel: "Ouvrir le suivi du temps",
      rows: [
        ["Société Atlas", "8,5 h", "À valider", 0],
        ["Groupe Andalous", "6,0 h", "Justificatif complet", 1],
        ["Projet Horizon", "4,0 h", "Prêt à facturer", 2],
      ],
    },
    performance: {
      title: personal ? "Avancement personnel" : "Encaissement",
      value: personal ? "82 %" : "87 %",
      hint: personal ? "Objectifs et actions prioritaires" : "Encaissements sur les 90 derniers jours",
      target: (personal ? "tasks" : "collections") as View,
      targetLabel: personal ? "Ouvrir mes tâches" : "Ouvrir les encaissements",
      rows: personal
        ? [
            ["Préparation audiences", "92 %", "1 action restante", 0],
            ["Validation des temps", "76 %", "3 éléments à traiter", 1],
            ["Suivi clients", "81 %", "2 réponses attendues", 2],
          ]
        : [
            ["Société Atlas", "96 400 DH", "Réglé à 92 %", 0],
            ["Groupe Andalous", "58 200 DH", "Relance planifiée", 1],
            ["Horizon Capital", "74 600 DH", "Échéance respectée", 2],
          ],
    },
  }[type];
  const visibleRows = type === "urgent" && personal ? data.rows.slice(0, 2) : data.rows;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="intake-modal dashboard-kpi-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span>PILOTAGE • {personal ? "MA JOURNÉE" : "CABINET"}</span>
            <h2>{data.title}</h2>
            <p>{data.hint}</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="dashboard-kpi-value">{data.value}</div>
        {type === "urgent" && !urgentValidated && (
          <div className="urgent-validation-banner">
            <div>
              <span>1 ÉCHÉANCE À EXAMINER</span>
              <b>Audience — Société Atlas</b>
              <small>Aujourd’hui à 09:30 • Validation attendue avant l’audience</small>
            </div>
            <div className="urgent-validation-actions">
              <button className="secondary" onClick={() => setAgendaPreviewOpen(true)}>Voir dans l’agenda</button>
              <button className="primary" onClick={() => setValidationOpen(true)}>Examiner et valider</button>
            </div>
          </div>
        )}
        <div className="dashboard-kpi-events">
          {visibleRows.map((row) => (
            <article key={row[0]}>
              <span><b>{row[0]}</b><small>{row[1]}</small></span>
              <em className={row[2] === "Validée" ? "validated" : ""}>{row[2]}</em>
              <div>
                <button onClick={() => onOpenMatter(matters[Number(row[3])])}>
                  Ouvrir le dossier ›
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Fermer</button>
          <button
            className="primary"
            onClick={() => type === "urgent" ? setAgendaPreviewOpen(true) : onNavigate(data.target)}
          >
            {data.targetLabel}
          </button>
        </div>
        {agendaPreviewOpen && (
          <div className="modal-backdrop nested-modal" onClick={() => setAgendaPreviewOpen(false)}>
            <div className="intake-modal agenda-preview-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <span>AGENDA JURIDIQUE • APERÇU</span>
                  <h2>Semaine du 1er août</h2>
                  <p>L’échéance à valider reste sélectionnée pendant votre vérification.</p>
                </div>
                <button onClick={() => setAgendaPreviewOpen(false)}>×</button>
              </div>
              <div className="agenda-preview-week">
                {[
                  ["Aujourd’hui", "09:30", "Audience — Société Atlas", "Tribunal de commerce • Salle 4", true],
                  ["Demain", "16:00", "Dépôt du mémoire Andalous", "Dépôt électronique • Responsable confirmé", false],
                  ["5 août", "12:00", "Transaction Horizon", "Réponse du client attendue", false],
                ].map((event) => (
                  <article className={event[4] ? "active" : ""} key={String(event[2])}>
                    <time><b>{event[0]}</b><span>{event[1]}</span></time>
                    <div><b>{event[2]}</b><small>{event[3]}</small></div>
                    {event[4] && <em>À valider</em>}
                  </article>
                ))}
              </div>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setAgendaPreviewOpen(false)}>← Retour à la validation</button>
                {!urgentValidated && (
                  <button
                    className="primary"
                    onClick={() => {
                      setAgendaPreviewOpen(false);
                      setValidationOpen(true);
                    }}
                  >
                    Examiner l’échéance
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {validationOpen && (
          <div className="modal-backdrop nested-modal" onClick={() => setValidationOpen(false)}>
            <div className="intake-modal deadline-validation-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <span>VALIDATION D’ÉCHÉANCE • IL-2026-0091</span>
                  <h2>Audience — Société Atlas</h2>
                  <p>Aujourd’hui à 09:30 • Tribunal de commerce • Salle 4</p>
                </div>
                <button onClick={() => setValidationOpen(false)}>×</button>
              </div>
              <div className="deadline-validation-checks">
                <h3>Éléments à contrôler avant validation</h3>
                {[
                  ["Date, heure et juridiction", "Confirmées par la convocation"],
                  ["Avocat responsable", "Sara Benali • présence confirmée"],
                  ["Conclusions et pièces", "Version officielle v4 disponible"],
                  ["Information du client", "Notification envoyée et reçue"],
                ].map((check) => (
                  <div key={check[0]}>
                    <i>✓</i>
                    <span><b>{check[0]}</b><small>{check[1]}</small></span>
                  </div>
                ))}
              </div>
              <div className="deadline-validation-note">
                <b>Ce que vous validez</b>
                <p>Vous confirmez que l’échéance est correctement qualifiée, attribuée, documentée et prête à être exécutée. Cette validation sera enregistrée dans le Journal d’audit.</p>
              </div>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setValidationOpen(false)}>Annuler</button>
                <button
                  className="primary"
                  onClick={() => {
                    onValidateUrgent();
                    setValidationOpen(false);
                  }}
                >
                  ✓ Valider l’échéance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function PanelTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action && (
        <button
          onClick={onAction ?? (() => announceAction(`${action} — ${title}`))}
        >
          {action} <span>›</span>
        </button>
      )}
    </div>
  );
}

function PriorityDeadlinesModal({
  lang,
  deadlines,
  onClose,
  onOpen,
}: {
  lang: Lang;
  deadlines: ReturnType<typeof getDeadlines>;
  onClose: () => void;
  onOpen: (matter: (typeof matters)[number]) => void;
}) {
  const labels =
    lang === "en"
      ? {
          eyebrow: "PRIORITY MONITORING",
          title: "All priority deadlines",
          hint: "Open the linked matter to view its documents, timeline and next actions.",
          matter: "Matter",
          owner: "Owner",
          open: "Open matter",
          close: "Close",
        }
      : lang === "ar"
        ? {
            eyebrow: "التتبع ذو الأولوية",
            title: "جميع الآجال ذات الأولوية",
            hint: "افتح الملف المرتبط للاطلاع على وثائقه وتسلسله الزمني والإجراءات القادمة.",
            matter: "الملف",
            owner: "المسؤول",
            open: "فتح الملف",
            close: "إغلاق",
          }
        : {
            eyebrow: "SUIVI PRIORITAIRE",
            title: "Toutes les échéances prioritaires",
            hint: "Ouvrez le dossier lié pour consulter ses pièces, sa chronologie et ses prochaines actions.",
            matter: "Dossier",
            owner: "Responsable",
            open: "Ouvrir le dossier",
            close: "Fermer",
          };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="intake-modal priority-deadlines-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>{labels.eyebrow}</span>
            <h2>{labels.title}</h2>
            <p>{labels.hint}</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="priority-deadline-list">
          {deadlines.map((deadline, index) => {
            const matter = matters[index];
            return (
              <article key={matter.ref}>
                <div className={`date ${deadline.tone}`}>
                  <b>{deadline.day}</b>
                  <small>{deadline.month}</small>
                </div>
                <div className="priority-deadline-copy">
                  <strong>{deadline.title}</strong>
                  <span>{deadline.meta}</span>
                  <small>
                    {labels.matter} : {matter.ref} • {labels.owner} : {matter.owner}
                  </small>
                </div>
                <time>{deadline.time}</time>
                <button className="primary" onClick={() => onOpen(matter)}>
                  {labels.open} <span>›</span>
                </button>
              </article>
            );
          })}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardPanelModal({
  lang,
  type,
  onClose,
  onOpenMatter,
  onOpenTasks,
}: {
  lang: Lang;
  type: "activity" | "workload";
  onClose: () => void;
  onOpenMatter: (matter: (typeof matters)[number]) => void;
  onOpenTasks: () => void;
}) {
  const labels =
    lang === "en"
      ? {
          activity: "Recent activity",
          workload: "Team workload",
          activityHint: "Chronological view of the firm’s latest operational events.",
          workloadHint: "Capacity, active matters and near-term actions by team member.",
          open: "Open matter",
          tasks: "View team tasks",
          close: "Close",
          matters: "active matters",
          next: "Next action",
        }
      : lang === "ar"
        ? {
            activity: "النشاط الأخير",
            workload: "عبء عمل الفريق",
            activityHint: "عرض زمني لآخر الأحداث التشغيلية للمكتب.",
            workloadHint: "القدرة والملفات النشطة والإجراءات القريبة لكل عضو في الفريق.",
            open: "فتح الملف",
            tasks: "عرض مهام الفريق",
            close: "إغلاق",
            matters: "ملفات نشطة",
            next: "الإجراء القادم",
          }
        : {
            activity: "Activité récente",
            workload: "Charge de l’équipe",
            activityHint: "Vue chronologique des derniers événements opérationnels du cabinet.",
            workloadHint: "Capacité, dossiers actifs et actions proches par membre de l’équipe.",
            open: "Ouvrir le dossier",
            tasks: "Voir les tâches de l’équipe",
            close: "Fermer",
            matters: "dossiers actifs",
            next: "Prochaine action",
          };
  const activities = [
    ["09:42", "Document ajouté", "Projet de conclusions v4", matters[0], "blue"],
    ["08:55", "Échéance acquittée", "Dépôt au greffe confirmé", matters[1], "green"],
    ["Hier", "Nouveau message client", "Horizon Capital — validation attendue", matters[2], "gold"],
    ["Hier", "Temps validé", "18,5 h prêtes pour la préfacturation", matters[0], "violet"],
    ["30 juil.", "Action réaffectée", "Relance confiée à Meryem Alaoui", matters[3], "amber"],
  ] as const;
  const team = [
    ["SB", "Sara Benali", "Associée", "82", "9", "Valider les conclusions Atlas"],
    ["NE", "Nadia El Idrissi", "Avocate senior", "68", "7", "Déposer le mémoire Andalous"],
    ["YA", "Youssef Amrani", "Avocat", "91", "6", "Obtenir la validation Horizon"],
    ["MA", "Meryem Alaoui", "Collaboratrice", "57", "6", "Relancer les créances Nord"],
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="intake-modal dashboard-panel-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>PILOTAGE DU CABINET</span>
            <h2>{type === "activity" ? labels.activity : labels.workload}</h2>
            <p>{type === "activity" ? labels.activityHint : labels.workloadHint}</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        {type === "activity" ? (
          <div className="dashboard-activity-list">
            {activities.map((item) => (
              <article key={`${item[0]}-${item[1]}`}>
                <i className={item[4]} />
                <time>{item[0]}</time>
                <div>
                  <b>{item[1]}</b>
                  <span>{item[2]}</span>
                  <small>{item[3].ref} • {item[3].client}</small>
                </div>
                <button className="secondary" onClick={() => onOpenMatter(item[3])}>
                  {labels.open} <span>›</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-workload-list">
            {team.map((member, index) => (
              <article key={member[0]}>
                <span className={`mini-avatar a${index}`}>{member[0]}</span>
                <div className="dashboard-member-copy">
                  <b>{member[1]}</b>
                  <small>{member[2]} • {member[4]} {labels.matters}</small>
                </div>
                <div className="dashboard-capacity">
                  <span><i style={{ width: `${member[3]}%` }} /></span>
                  <b>{member[3]}%</b>
                </div>
                <div className="dashboard-next-action">
                  <small>{labels.next}</small>
                  <b>{member[5]}</b>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>{labels.close}</button>
          {type === "workload" && (
            <button className="primary" onClick={onOpenTasks}>{labels.tasks}</button>
          )}
        </div>
      </div>
    </div>
  );
}
function Timeline() {
  return (
    <div className="timeline">
      {[
        [
          "Document ajouté",
          "Projet de conclusions v4 — IL-2026-0091",
          "09:42",
          "blue",
        ],
        [
          "Échéance acquittée",
          "Dépôt au greffe confirmé par N. El Idrissi",
          "08:55",
          "green",
        ],
        [
          "Nouveau message client",
          "Horizon Capital — Projet d’acquisition",
          "Hier",
          "gold",
        ],
        [
          "Temps validé",
          "18,5 h validées pour la préfacturation",
          "Hier",
          "violet",
        ],
      ].map((x, i) => (
        <div className="timeline-item" key={i}>
          <i className={x[3]} />
          <div>
            <b>{x[0]}</b>
            <span>{x[1]}</span>
          </div>
          <time>{x[2]}</time>
        </div>
      ))}
    </div>
  );
}
function Team() {
  return (
    <div className="team-list">
      {[
        ["SB", "Sara Benali", "Associée", "82"],
        ["NE", "Nadia El Idrissi", "Avocate senior", "68"],
        ["YA", "Youssef Amrani", "Avocat", "91"],
        ["MA", "Meryem Alaoui", "Collaboratrice", "57"],
      ].map((x, i) => (
        <div className="team-row" key={i}>
          <span className={`mini-avatar a${i}`}>{x[0]}</span>
          <div>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
          </div>
          <div className="team-bar">
            <i style={{ width: x[3] + "%" }} />
          </div>
          <strong>{x[3]}%</strong>
        </div>
      ))}
    </div>
  );
}
function Revenue() {
  return (
    <>
      <div className="revenue-values">
        <div>
          <span>Facturé</span>
          <b>486 200 DH</b>
          <small>+12,4% vs période précédente</small>
        </div>
        <div>
          <span>Encaissé</span>
          <b>422 900 DH</b>
          <small>87% du montant facturé</small>
        </div>
      </div>
      <div className="bars">
        {[42, 55, 48, 67, 58, 76, 65, 82, 78, 88, 71, 92].map((v, i) => (
          <i key={i} style={{ height: `${v}%` }}>
            <b style={{ height: `${Math.max(v - 18, 12)}%` }} />
          </i>
        ))}
      </div>
      <div className="bar-labels">
        <span>Mai</span>
        <span>Juin</span>
        <span>Juil.</span>
      </div>
    </>
  );
}
function ConflictView({ notify }: { notify: (x: string) => void }) {
  return (
    <div className="module-cards">
      <div className="panel conflict-search">
        <h2>Nouveau contrôle</h2>
        <p>
          Rechercher les clients, parties, bénéficiaires et relations avant
          toute acceptation.
        </p>
        <label>
          <span>Parties à contrôler</span>
          <input placeholder="Ex. Société Atlas, dirigeants, filiales…" />
        </label>
        <button
          className="primary"
          onClick={() =>
            notify("Recherche lancée — aucune donnée réelle utilisée")
          }
        >
          ◇ Lancer le contrôle
        </button>
      </div>
      <div className="panel">
        <PanelTitle title="Contrôles récents" action="Voir le registre" />
        {[
          [
            "CC-2026-0142",
            "Groupe Zellige / Nova Holding",
            "Correspondance possible",
            "amber",
          ],
          [
            "CC-2026-0141",
            "Amal Industries / Banque Union",
            "Aucun conflit",
            "green",
          ],
          [
            "CC-2026-0140",
            "Maroc Distribution / Atlas",
            "Validation requise",
            "red",
          ],
        ].map((x) => (
          <div className="check-row" key={x[0]}>
            <div>
              <b>{x[1]}</b>
              <small>{x[0]} • Aujourd’hui</small>
            </div>
            <i className={`check ${x[3]}`}>{x[2]}</i>
          </div>
        ))}
      </div>
    </div>
  );
}
function CalendarView({ lang }: { lang: Lang }) {
  const [currentDate] = useState(() => new Date());
  const calendarDeadlines = getDeadlines(lang, currentDate);
  const locale = lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-MA";
  const calendarDays = Array.from({ length: 5 }, (_, offset) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    return {
      weekday: new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "Africa/Casablanca",
      })
        .format(date)
        .replace(".", ""),
      day: new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        timeZone: "Africa/Casablanca",
      }).format(date),
    };
  });
  return (
    <div className="panel calendar-view">
      <div className="calendar-days">
        {calendarDays.map((date, i) => (
          <div
            className={i === 0 ? "current" : ""}
            key={`${date.weekday}-${date.day}`}
          >
            <b>{date.weekday}</b>
            <span>{date.day}</span>
          </div>
        ))}
      </div>
      <div className="calendar-events">
        {calendarDeadlines.map((d, i) => (
          <div
            key={i}
            className={`event ${d.tone}`}
            style={{ gridColumn: i + 1 }}
          >
            <time>{d.time}</time>
            <b>{d.title}</b>
            <span>{d.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DocumentView({
  onAdd,
  onOpen,
}: {
  onAdd?: () => void;
  onOpen?: () => void;
}) {
  return (
    <div className="panel table-panel">
      <div className="document-toolbar">
        <div>
          <b>Bibliothèque documentaire</b>
          <span>Versions, pièces, courriers et originaux</span>
        </div>
        {onAdd && (
          <button className="primary" onClick={onAdd}>
            ＋ Ajouter un document
          </button>
        )}
      </div>
      <div className="document-grid">
        {[
          [
            "PDF",
            "Conclusions — version officielle",
            "IL-2026-0091",
            "Aujourd’hui, 09:42",
            "Officiel",
          ],
          [
            "DOCX",
            "Projet de transaction v3",
            "IL-2026-0064",
            "Hier, 17:10",
            "Brouillon",
          ],
          [
            "PDF",
            "PV d’audience du 29 juillet",
            "IL-2026-0087",
            "29 juil., 15:24",
            "Pièce",
          ],
          [
            "XLSX",
            "État des créances clients",
            "IL-2026-0042",
            "28 juil., 11:08",
            "Interne",
          ],
        ].map((x, i) => (
          <button className="doc-row doc-link" key={i} onClick={onOpen}>
            <span className="file-icon">{x[0]}</span>
            <div>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </div>
            <i className={`doc-status s${i}`}>{x[4]}</i>
            <span>{x[3]}</span>
            <i>⋮</i>
          </button>
        ))}
      </div>
    </div>
  );
}
function ClientView({ addedClients = [] }: { addedClients?: string[] }) {
  return (
    <div className="client-grid">
      {addedClients
        .map((name) => [
          name.slice(0, 2).toUpperCase(),
          name,
          "Nouveau client • Casablanca",
          "0 dossier",
        ])
        .concat([
          ["SA", "Société Atlas", "Distribution • Casablanca", "8 dossiers"],
          ["GA", "Groupe Andalous", "Holding • Rabat", "5 dossiers"],
          [
            "HC",
            "Horizon Capital",
            "Investissement • Casablanca",
            "3 dossiers",
          ],
          ["LN", "Logis Nord", "Logistique • Tanger", "6 dossiers"],
        ])
        .map((x, i) => (
          <div className="panel client-card" key={i}>
            <span className={`client-logo c${i}`}>{x[0]}</span>
            <h3>{x[1]}</h3>
            <p>{x[2]}</p>
            <div>
              <b>{x[3]}</b>
              <span>Actif</span>
            </div>
          </div>
        ))}
    </div>
  );
}

function ClientCreateModal({
  lang,
  onClose,
  onCreated,
}: {
  lang: Lang;
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const labels =
    lang === "en"
      ? { title: "New client", save: "Create client", cancel: "Cancel" }
      : lang === "ar"
        ? { title: "عميل جديد", save: "إنشاء العميل", cancel: "إلغاء" }
        : {
            title: "Nouveau client",
            save: "Créer le client",
            cancel: "Annuler",
          };
  return (
    <div className="modal-backdrop">
      <form
        className="intake-modal client-create-modal"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onCreated(String(data.get("name")));
          onClose();
        }}
      >
        <div className="modal-head">
          <div>
            <span>RELATION CLIENT</span>
            <h2>{labels.title}</h2>
            <p>Identité, contacts, vigilance et responsable de relation.</p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="client-form">
          <label className="wide">
            Dénomination
            <input name="name" required placeholder="Ex. Société Al Manar" />
          </label>
          <label>
            Type
            <select name="type">
              <option>Entreprise</option>
              <option>Personne physique</option>
              <option>Institution</option>
            </select>
          </label>
          <label>
            Identifiant ICE
            <input name="ice" placeholder="15 chiffres" />
          </label>
          <label>
            Secteur d’activité
            <input name="sector" placeholder="Ex. Distribution" />
          </label>
          <label>
            Ville
            <input name="city" defaultValue="Casablanca" />
          </label>
          <label>
            Contact principal
            <input name="contact" placeholder="Nom et fonction" />
          </label>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="contact@entreprise.ma"
            />
          </label>
          <label>
            Téléphone
            <input name="phone" placeholder="+212 …" />
          </label>
          <label>
            Responsable de relation
            <select name="owner">
              <option>Sara Benali</option>
              <option>Nadia El Idrissi</option>
              <option>Youssef Amrani</option>
            </select>
          </label>
          <label className="wide">
            Observation
            <textarea
              name="notes"
              placeholder="Contexte de la relation, besoin et prochaine action…"
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            {labels.cancel}
          </button>
          <button className="primary">{labels.save}</button>
        </div>
      </form>
    </div>
  );
}

function ActionDetailModal({
  detail,
  onClose,
}: {
  detail: string;
  onClose: () => void;
}) {
  const [action, context = "Vue consolidée"] = detail.split(" — ");
  const isProfitability = context === "Rentabilité par dossier";
  const subject = /plan d.action/i.test(context)
    ? "plan"
    : /qualité|conformité/i.test(context)
      ? "quality"
      : /risque|répartition des dossiers/i.test(context)
        ? "risk"
        : /facturation|encaissement/i.test(context)
          ? "finance"
          : /activité|production|volume/i.test(context)
            ? "activity"
            : null;
  return (
    <div className="modal-backdrop">
      <div className="intake-modal action-detail-modal">
        <div className="modal-head">
          <div>
            <span>CONSULTATION DÉTAILLÉE</span>
            <h2>{context}</h2>
            <p>{action} • données consolidées du cabinet</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        {isProfitability ? (
          <>
            <div className="profit-analysis-kpis">
              <div>
                <span>Production totale</span>
                <b>486 200 DH</b>
                <small>+12,4 % sur la période</small>
              </div>
              <div>
                <span>Coût interne</span>
                <b>282 640 DH</b>
                <small>58,2 % de la production</small>
              </div>
              <div>
                <span>Marge estimée</span>
                <b>41,8 %</b>
                <small>Objectif cabinet : 40 %</small>
              </div>
              <div>
                <span>Écart budgétaire</span>
                <b>+94 200 DH</b>
                <small>3 dossiers au-dessus du budget</small>
              </div>
            </div>
            <div className="profit-analysis-table">
              <div className="profit-analysis-row header">
                <span>Dossier</span>
                <span>Production</span>
                <span>Coût interne</span>
                <span>Marge</span>
                <span>Budget</span>
                <span>Écart</span>
                <span>Tendance</span>
              </div>
              {[
                [
                  "Projet Horizon",
                  "168 400 DH",
                  "80 832 DH",
                  "52 %",
                  "140 400 DH",
                  "+28 000 DH",
                  "↗",
                ],
                [
                  "Atlas c/ Distribution",
                  "148 600 DH",
                  "92 132 DH",
                  "38 %",
                  "94 600 DH",
                  "+54 000 DH",
                  "→",
                ],
                [
                  "Groupe Andalous",
                  "112 900 DH",
                  "63 224 DH",
                  "44 %",
                  "94 300 DH",
                  "+18 600 DH",
                  "↗",
                ],
                [
                  "Créances Logis Nord",
                  "56 300 DH",
                  "42 788 DH",
                  "24 %",
                  "62 700 DH",
                  "−6 400 DH",
                  "↘",
                ],
              ].map((row, index) => (
                <button
                  className="profit-analysis-row"
                  key={row[0]}
                  onClick={() => announceAction(`Détail financier — ${row[0]}`)}
                >
                  <b>{row[0]}</b>
                  <span>{row[1]}</span>
                  <span>{row[2]}</span>
                  <i className={index === 3 ? "low" : ""}>{row[3]}</i>
                  <span>{row[4]}</span>
                  <em className={index === 3 ? "negative" : "positive"}>
                    {row[5]}
                  </em>
                  <strong className={index === 3 ? "down" : ""}>
                    {row[6]}
                  </strong>
                </button>
              ))}
            </div>
            <div className="profit-analysis-note">
              <b>Point d’attention</b>
              <span>
                Le dossier Créances Logis Nord présente une marge de 24 %,
                inférieure à l’objectif de 40 %. Une revue du périmètre, du
                temps consommé et de la convention d’honoraires est recommandée.
              </span>
            </div>
          </>
        ) : subject ? (
          <ReportSubjectAnalysis subject={subject} />
        ) : (
          <>
            <div className="action-detail-kpis">
              <div>
                <span>Éléments suivis</span>
                <b>28</b>
                <small>4 nouveaux ce mois</small>
              </div>
              <div>
                <span>À traiter</span>
                <b>5</b>
                <small>2 prioritaires</small>
              </div>
              <div>
                <span>Conformes</span>
                <b>91%</b>
                <small>+4 points</small>
              </div>
            </div>
          </>
        )}
        {!isProfitability && !subject && (
          <div className="action-detail-list">
            {[
              "Éléments prioritaires et alertes",
              "Historique et dernières modifications",
              "Responsables, échéances et prochaines actions",
            ].map((item, index) => (
              <button
                key={item}
                onClick={() => announceAction(`${item} — ${context}`)}
              >
                <i>{index + 1}</i>
                <span>
                  <b>{item}</b>
                  <small>Ouvrir la vue détaillée et les justificatifs</small>
                </span>
                <em>›</em>
              </button>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Fermer
          </button>
          <button
            className="primary"
            onClick={() => announceAction(`Export préparé — ${context}`)}
          >
            Exporter la vue
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportSubjectAnalysis({
  subject,
}: {
  subject: "activity" | "finance" | "risk" | "quality" | "plan";
}) {
  const [planActionOpen, setPlanActionOpen] = useState(false);
  const [addedPlanActions, setAddedPlanActions] = useState<string[][]>([]);
  const data = {
    activity: {
      kpis: [
        ["Dossiers actifs", "28", "+4"],
        ["Actes produits", "146", "+16,8 %"],
        ["Audiences", "18", "94 % préparées"],
        ["Temps saisi", "1 284 h", "91 % validé"],
      ],
      columns: [
        "Mois",
        "Dossiers ouverts",
        "Actes produits",
        "Heures",
        "Taux réalisé",
      ],
      rows: [
        ["Avril", "5", "31", "276 h", "88 %"],
        ["Mai", "7", "36", "302 h", "91 %"],
        ["Juin", "6", "38", "329 h", "93 %"],
        ["Juillet", "10", "41", "377 h", "96 %"],
      ],
      note: "La production progresse de 16,8 %, portée par le contentieux commercial. La capacité de l’équipe atteint 92 % sur les deux prochaines semaines.",
    },
    finance: {
      kpis: [
        ["Facturé HT", "486 200 DH", "+12,4 %"],
        ["Encaissé", "392 800 DH", "80,8 %"],
        ["À facturer", "74 600 DH", "18 dossiers"],
        ["Impayés", "36 400 DH", "4 relances"],
      ],
      columns: ["Période", "Facturé", "Encaissé", "Restant", "Taux"],
      rows: [
        ["Avril", "98 400 DH", "91 200 DH", "7 200 DH", "92,7 %"],
        ["Mai", "112 600 DH", "96 400 DH", "16 200 DH", "85,6 %"],
        ["Juin", "126 800 DH", "104 600 DH", "22 200 DH", "82,5 %"],
        ["Juillet", "148 400 DH", "100 600 DH", "47 800 DH", "67,8 %"],
      ],
      note: "Le taux d’encaissement est inférieur à l’objectif de 85 %. Quatre créances nécessitent une relance prioritaire.",
    },
    risk: {
      kpis: [
        ["Risque faible", "12", "43 %"],
        ["Risque moyen", "11", "39 %"],
        ["Risque élevé", "5", "18 %"],
        ["Sans suppléant", "3", "Action requise"],
      ],
      columns: [
        "Dossier",
        "Niveau",
        "Facteur principal",
        "Responsable",
        "Prochaine revue",
      ],
      rows: [
        [
          "Atlas c/ Distribution",
          "Élevé",
          "Échéance critique",
          "S. Benali",
          "Aujourd’hui",
        ],
        [
          "Groupe Andalous",
          "Élevé",
          "KYC à renouveler",
          "N. El Idrissi",
          "3 août",
        ],
        [
          "Créances Logis Nord",
          "Moyen",
          "Marge et recouvrement",
          "M. Alaoui",
          "5 août",
        ],
        ["Projet Horizon", "Faible", "Suivi standard", "Y. Amrani", "12 août"],
      ],
      note: "Cinq dossiers présentent un risque élevé. Les trois échéances sans suppléant doivent être sécurisées en priorité.",
    },
    quality: {
      kpis: [
        ["Dossiers complets", "89 %", "+5 pts"],
        ["Échéances acquittées", "96 %", "3 à traiter"],
        ["Documents classés", "82 %", "+7 pts"],
        ["Validation sous 48 h", "74 %", "+9 pts"],
      ],
      columns: ["Dimension", "Résultat", "Objectif", "Écart", "Action"],
      rows: [
        ["Complétude dossiers", "89 %", "95 %", "−6 pts", "Revue pièces"],
        ["Maîtrise échéances", "96 %", "98 %", "−2 pts", "Suppléance"],
        ["Classement documents", "82 %", "95 %", "−13 pts", "Régulariser"],
        ["Portail client", "68 %", "85 %", "−17 pts", "Actualiser"],
      ],
      note: "Le portail client et le classement documentaire concentrent les principaux écarts. Les actions sont intégrées au plan qualité.",
    },
    plan: {
      kpis: [
        ["Actions ouvertes", "12", "3 nouvelles"],
        ["Priorité P0", "2", "Aujourd’hui"],
        ["En retard", "3", "Escalade"],
        ["Clôturées", "26", "Ce trimestre"],
      ],
      columns: ["Priorité", "Action", "Responsable", "Échéance", "Statut"],
      rows: [
        [
          "P0",
          "Sécuriser les échéances sans suppléant",
          "Sara Benali",
          "Aujourd’hui",
          "En cours",
        ],
        [
          "P0",
          "Relancer les quatre créances prioritaires",
          "Meryem Alaoui",
          "2 août",
          "À lancer",
        ],
        [
          "P1",
          "Régulariser les documents non classés",
          "Nadia El Idrissi",
          "5 août",
          "Planifiée",
        ],
        [
          "P1",
          "Rééquilibrer la charge contentieux",
          "Sara Benali",
          "6 août",
          "À décider",
        ],
      ],
      note: "Deux actions P0 nécessitent une décision aujourd’hui. Les responsables et échéances sont tracés dans le plan de direction.",
    },
  }[subject];
  return (
    <>
      <div className="subject-analysis-kpis">
        {data.kpis.map((kpi) => (
          <div key={kpi[0]}>
            <span>{kpi[0]}</span>
            <b>{kpi[1]}</b>
            <small>{kpi[2]}</small>
          </div>
        ))}
      </div>
      <div className="subject-analysis-table">
        <div className="subject-analysis-row header">
          {data.columns.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        {(subject === "plan"
          ? [...addedPlanActions, ...data.rows]
          : data.rows
        ).map((row) => (
          <button
            className="subject-analysis-row"
            key={row[0]}
            onClick={() => announceAction(`Détail — ${row[0]}`)}
          >
            {row.map((cell, index) =>
              index === 0 ? (
                <b key={cell}>{cell}</b>
              ) : (
                <span key={`${cell}-${index}`}>{cell}</span>
              ),
            )}
          </button>
        ))}
      </div>
      <div className={`subject-analysis-note ${subject}`}>
        <b>Lecture de pilotage</b>
        <span>{data.note}</span>
      </div>
      {subject === "plan" && (
        <div className="subject-analysis-actions">
          <button className="primary" onClick={() => setPlanActionOpen(true)}>
            ＋ Nouvelle action
          </button>
        </div>
      )}
      {planActionOpen && (
        <NewPlanActionModal
          onClose={() => setPlanActionOpen(false)}
          onCreated={(row) => {
            setAddedPlanActions((actions) => [row, ...actions]);
            setPlanActionOpen(false);
          }}
        />
      )}
    </>
  );
}

function NewPlanActionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (row: string[]) => void;
}) {
  return (
    <div className="modal-backdrop nested-modal">
      <form
        className="intake-modal plan-action-modal"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const dueDate = new Date(String(data.get("due"))).toLocaleDateString(
            "fr-MA",
            { day: "2-digit", month: "short" },
          );
          onCreated([
            String(data.get("priority")),
            String(data.get("action")),
            String(data.get("owner")),
            dueDate,
            String(data.get("status")),
          ]);
        }}
      >
        <div className="modal-head">
          <div>
            <span>PLAN DE DIRECTION</span>
            <h2>Créer une nouvelle action</h2>
            <p>
              L’action sera suivie avec son responsable, son échéance et son
              statut.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="client-form plan-action-form">
          <label className="wide">
            Action
            <input
              name="action"
              required
              placeholder="Ex. Sécuriser la revue des dossiers sensibles"
            />
          </label>
          <label>
            Priorité
            <select name="priority">
              <option>P0</option>
              <option>P1</option>
              <option>P2</option>
            </select>
          </label>
          <label>
            Responsable
            <select name="owner">
              <option>Sara Benali</option>
              <option>Nadia El Idrissi</option>
              <option>Youssef Amrani</option>
              <option>Meryem Alaoui</option>
            </select>
          </label>
          <label>
            Échéance
            <input name="due" type="date" required defaultValue="2026-08-08" />
          </label>
          <label>
            Statut
            <select name="status">
              <option>Planifiée</option>
              <option>En cours</option>
              <option>À décider</option>
            </select>
          </label>
          <label className="wide">
            Résultat attendu
            <textarea
              name="result"
              placeholder="Décrire le résultat mesurable et les éléments de preuve…"
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary">Créer l’action</button>
        </div>
      </form>
    </div>
  );
}

function MatterDetail({
  matter,
  onBack,
  notify,
}: {
  matter: (typeof matters)[number];
  onBack: () => void;
  notify: (x: string) => void;
}) {
  const [liveDetail, setLiveDetail] = useState<Matter360 | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(Boolean(matter.id));
  const [tab, setTab] = useState("overview");
  const [hearingMode, setHearingMode] = useState<"prepare" | "report" | null>(
    null,
  );
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [preinvoiceOpen, setPreinvoiceOpen] = useState(false);
  const tabs = [
    ["overview", "Synthèse"],
    ["timeline", "Chronologie"],
    ["parties", "Parties"],
    ["procedure", "Procédure"],
    ["deadlines", "Échéances"],
    ["documents", "Documents"],
    ["finance", "Temps & honoraires"],
    ["budget", "Budget & honoraires"],
    ["risk", "Risques"],
  ];
  useEffect(() => {
    if (!matter.id) return;
    const controller = new AbortController();
    legalApi.getMatter360(matter.id, controller.signal)
      .then((detail) => { setLiveDetail(detail); setDetailError(""); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setDetailError(apiErrorMessage(error, "fr"));
      })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [matter.id]);
  return (
    <div className="matter-detail">
      <button className="back-link" onClick={onBack}>
        ‹ Retour aux dossiers
      </button>
      <div className="detail-head">
        <div>
          <div className="detail-ref">
            <span>{matter.ref}</span>
            <i className={`badge ${matter.risk}`}>
              Risque {matter.risk.toLowerCase()}
            </i>
            <i className="status-pill">Actif</i>
          </div>
          <h1>{matter.name}</h1>
          <p>
            {matter.client} • {matter.type} • Confidentiel cabinet
          </p>
        </div>
        <div className="head-buttons">
          <button
            className="secondary"
            onClick={() => notify("Lien sécurisé préparé")}
          >
            ↗ Partager
          </button>
          <button
            className="primary"
            onClick={() => notify("Nouvelle action ajoutée")}
          >
            ＋ Nouvelle action
          </button>
        </div>
      </div>
      <div className="detail-tabs">
        {tabs.map((x) => (
          <button
            key={x[0]}
            className={tab === x[0] ? "selected" : ""}
            onClick={() => setTab(x[0])}
          >
            {x[1]}
          </button>
        ))}
      </div>
      {matter.id && detailLoading && <DataState state="loading" message="" lang="fr" />}
      {matter.id && detailError && <DataState state="error" message={detailError} lang="fr" />}
      {matter.id && liveDetail ? (
        <LiveMatter360 detail={liveDetail} />
      ) : !matter.id ? (
        <>
      {tab === "overview" && (
        <MatterOverview
          matter={matter}
          onPrepare={() => setHearingMode("prepare")}
        />
      )}{" "}
      {tab === "timeline" && <MatterTimeline />}{" "}
      {tab === "parties" && <Parties />}{" "}
      {tab === "procedure" && (
        <Procedure
          onPrepare={() => setHearingMode("prepare")}
          onReport={() => setHearingMode("report")}
        />
      )}{" "}
      {tab === "deadlines" && (
        <MatterDeadlines onNew={() => setDeadlineOpen(true)} />
      )}{" "}
      {tab === "documents" && <DocumentView />}{" "}
      {tab === "finance" && (
        <MatterFinance onPreinvoice={() => setPreinvoiceOpen(true)} />
      )}{" "}
      {tab === "budget" && <MatterBudget notify={notify} />}{" "}
      {tab === "risk" && <MatterRisks />}
        </>
      ) : null}
      {hearingMode && (
        <HearingModal
          mode={hearingMode}
          onClose={() => setHearingMode(null)}
          notify={notify}
        />
      )}{" "}
      {deadlineOpen && (
        <DeadlineModal onClose={() => setDeadlineOpen(false)} notify={notify} />
      )}{" "}
      {preinvoiceOpen && (
        <PreinvoiceModal
          onClose={() => setPreinvoiceOpen(false)}
          notify={notify}
        />
      )}
    </div>
  );
}

function LiveMatter360({ detail }: { detail: Matter360 }) {
  const money = (value: number) => new Intl.NumberFormat("fr-MA", { style: "currency", currency: detail.financial.currency }).format(value);
  return (
    <div className="detail-layout live-360">
      <section>
        <div className="panel detail-summary">
          <PanelTitle title="Vue 360 — données opérationnelles" action="API /api/v1" />
          <div className="summary-grid">
            <Label value={detail.matter.clientName} label="Client" />
            <Label value={statusLabel(detail.matter.status, "fr")} label="Statut" />
            <Label value={String(detail.parties.length)} label="Parties" />
            <Label value={String(detail.deadlines.length)} label="Échéances" />
            <Label value={String(detail.documents.length)} label="Documents" />
            <Label value={String(detail.procedures.length)} label="Procédures" />
          </div>
        </div>
        <div className="panel table-panel">
          <PanelTitle title="Échéances" action={`${detail.deadlines.length}`} />
          {detail.deadlines.length ? detail.deadlines.map((item) => <div className="live-row" key={item.id}><b>{item.title}</b><span>{new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dueAt))}</span></div>) : <p>Aucune échéance.</p>}
        </div>
        <div className="panel table-panel">
          <PanelTitle title="Parties et conflits" action={`${detail.conflictChecks.length} contrôle(s)`} />
          {detail.parties.length ? detail.parties.map((item) => <div className="live-row" key={item.id}><b>{item.displayName}</b><span>{item.roleCode}{item.isAdverse ? " • partie adverse" : ""}</span></div>) : <p>Aucune partie.</p>}
        </div>
        <div className="panel table-panel">
          <PanelTitle title="Procédures et audiences" action={`${detail.hearings.length} audience(s)`} />
          {detail.procedures.length ? detail.procedures.map((item) => <div className="live-row" key={item.id}><b>{item.procedureType}</b><span>{item.jurisdiction}</span></div>) : <p>Aucune procédure.</p>}
        </div>
        <div className="panel table-panel">
          <PanelTitle title="Documents" action={`${detail.documents.length}`} />
          {detail.documents.length ? detail.documents.map((item) => <div className="live-row" key={item.id}><b>{item.title}</b><span>{item.classification} • v{item.versionCount}</span></div>) : <p>Aucun document.</p>}
        </div>
      </section>
      <aside>
        <div className="panel">
          <PanelTitle title="Finance" action={detail.financial.currency} />
          <div className="live-finance"><b>{Math.round(detail.financial.totalMinutes / 60)} h</b><span>Temps saisi</span></div>
          <div className="live-finance"><b>{money(detail.financial.totalExpenses)}</b><span>Frais</span></div>
          <div className="live-finance"><b>{detail.financial.budgetAmount === null ? "—" : money(detail.financial.budgetAmount)}</b><span>Budget</span></div>
          <div className="live-finance"><b>{money(detail.financial.approvedPrebillsTotal)}</b><span>Préfactures approuvées</span></div>
        </div>
      </aside>
    </div>
  );
}

function MatterOverview({
  matter,
  onPrepare,
}: {
  matter: (typeof matters)[number];
  onPrepare: () => void;
}) {
  return (
    <div className="detail-layout">
      <section>
        <div className="panel detail-summary">
          <PanelTitle title="Vue d’ensemble" action="Modifier" />
          <div className="summary-grid">
            <Label value={matter.client} label="Client" />
            <Label value={matter.owner} label="Responsable" />
            <Label value="31 juillet 2026" label="Ouverture" />
            <Label value="Contentieux commercial" label="Nature" />
            <Label value="Tribunal de commerce" label="Juridiction" />
            <Label value="Accès équipe restreint" label="Confidentialité" />
          </div>
          <h3>Objet du dossier</h3>
          <p>
            Litige relatif à l’exécution d’un contrat de distribution, aux
            pénalités contestées et à la réparation du préjudice commercial
            allégué.
          </p>
        </div>
        <div className="panel">
          <PanelTitle
            title="Prochaines actions"
            action="Voir le plan de travail"
          />
          {[
            [
              "Préparer le dossier d’audience",
              "Sara Benali",
              "Aujourd’hui • 17:00",
              "red",
            ],
            [
              "Valider les pièces 12 à 18",
              "Nadia El Idrissi",
              "Aujourd’hui • 15:30",
              "amber",
            ],
            [
              "Informer le client après audience",
              "Meryem Alaoui",
              "01 août • 14:00",
              "blue",
            ],
          ].map((x, i) => (
            <div className="action-row" key={i}>
              <i className={x[3]} />
              <div>
                <b>{x[0]}</b>
                <span>{x[1]}</span>
              </div>
              <time>{x[2]}</time>
              <button
                onClick={() => announceAction(`Action ouverte — ${x[0]}`)}
              >
                ○
              </button>
            </div>
          ))}
        </div>
      </section>
      <aside>
        <div className="panel next-event">
          <span>PROCHAINE ÉCHÉANCE</span>
          <div>
            <b>01</b>
            <small>AOÛT 2026</small>
          </div>
          <h3>Audience de mise en état</h3>
          <p>
            09:30 • Tribunal de commerce
            <br />
            Salle 4 — Casablanca
          </p>
          <button className="primary" onClick={onPrepare}>
            Ouvrir la préparation
          </button>
        </div>
        <div className="panel">
          <PanelTitle title="Équipe du dossier" action="Gérer" />
          {[
            ["SB", "Sara Benali", "Responsable"],
            ["NE", "Nadia El Idrissi", "Avocate senior"],
            ["MA", "Meryem Alaoui", "Collaboratrice"],
          ].map((x, i) => (
            <div className="member" key={i}>
              <span className={`mini-avatar a${i}`}>{x[0]}</span>
              <div>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="panel health">
          <PanelTitle title="Santé du dossier" action="Détails" />
          <div className="health-score">
            <strong>78</strong>
            <span>/100</span>
          </div>
          <p>Deux actions prioritaires avant l’audience.</p>
        </div>
      </aside>
    </div>
  );
}
function Label({ label, value }: { label: string; value: string }) {
  return (
    <div className="label">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
function MatterTimeline() {
  return (
    <div className="panel wide-panel">
      <PanelTitle
        title="Chronologie du dossier"
        action="Ajouter un événement"
      />
      {[
        [
          "31 juillet • 09:42",
          "Projet de conclusions v4 ajouté",
          "Document",
          "S. Benali",
        ],
        [
          "30 juillet • 16:18",
          "Échéance de préparation acquittée",
          "Échéance",
          "N. El Idrissi",
        ],
        [
          "29 juillet • 14:05",
          "Compte rendu client envoyé",
          "Communication",
          "M. Alaoui",
        ],
        [
          "25 juillet • 10:30",
          "Audience reportée au 1er août",
          "Audience",
          "S. Benali",
        ],
        [
          "18 juillet • 11:15",
          "Pièces adverses reçues et classées",
          "Pièces",
          "N. El Idrissi",
        ],
      ].map((x, i) => (
        <div className="history-row" key={i}>
          <time>{x[0]}</time>
          <i />
          <div>
            <b>{x[1]}</b>
            <span>
              {x[2]} • {x[3]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
function Parties() {
  return (
    <div className="party-grid">
      {[
        [
          "SA",
          "Société Atlas",
          "Cliente / demanderesse",
          "Représentée par A. Karim",
        ],
        [
          "MD",
          "Maroc Distribution",
          "Défenderesse",
          "Conseil adverse : Cabinet Rami",
        ],
        [
          "AK",
          "Amine Karim",
          "Directeur général",
          "Représentant de la cliente",
        ],
        ["LH", "Leïla Haddad", "Témoin", "Directrice commerciale"],
      ].map((x, i) => (
        <div className="panel party-card" key={i}>
          <span className={`client-logo c${i}`}>{x[0]}</span>
          <div>
            <h3>{x[1]}</h3>
            <b>{x[2]}</b>
            <p>{x[3]}</p>
          </div>
          <button onClick={() => announceAction(`Options ouvertes — ${x[1]}`)}>
            ⋮
          </button>
        </div>
      ))}
    </div>
  );
}
function Procedure({
  onPrepare,
  onReport,
}: {
  onPrepare: () => void;
  onReport: () => void;
}) {
  return (
    <div className="detail-layout">
      <section>
        <div className="panel">
          <PanelTitle title="Procédure principale" action="Modifier" />
          <div className="summary-grid">
            <Label
              label="Juridiction"
              value="Tribunal de commerce de Casablanca"
            />
            <Label label="Référence" value="2026/8201/1472" />
            <Label label="Phase" value="Mise en état" />
            <Label label="Statut" value="En cours" />
            <Label label="Chambre" value="4e chambre" />
            <Label label="Prochaine audience" value="01 août 2026 • 09:30" />
          </div>
        </div>
        <div className="panel">
          <PanelTitle title="Historique des audiences" action="Ajouter" />
          {[
            [
              "01 août 2026",
              "À venir",
              "Mise en état — conclusions en réponse",
            ],
            [
              "25 juillet 2026",
              "Reportée",
              "Renvoi à la demande de la partie adverse",
            ],
            ["04 juillet 2026", "Tenue", "Communication des pièces"],
          ].map((x, i) => (
            <div className="hearing-row" key={i}>
              <time>{x[0]}</time>
              <i className={x[1] === "À venir" ? "blue" : "gray"}>{x[1]}</i>
              <span>{x[2]}</span>
              {i === 0 ? (
                <button className="mini-action" onClick={onPrepare}>
                  Préparer
                </button>
              ) : i === 1 ? (
                <button className="mini-action" onClick={onReport}>
                  Régulariser
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <aside>
        <div className="panel">
          <PanelTitle title="Références" action="" />
          <Label label="Avocat adverse" value="Me Rachid Rami" />
          <Label label="Greffe" value="Bureau 12" />
          <Label label="Nature" value="Contrat de distribution" />
        </div>
      </aside>
    </div>
  );
}
function MatterDeadlines({ onNew }: { onNew: () => void }) {
  return (
    <div className="panel wide-panel">
      <div className="panel-title">
        <h2>Échéances du dossier</h2>
        <button onClick={onNew}>
          Nouvelle échéance <span>＋</span>
        </button>
      </div>
      {getDeadlines("fr", new Date())
        .concat([
          {
            date: new Date(),
            offsetDays: 11,
            day: "12",
            month: "AOÛ",
            time: "18:00",
            title: "Transmission du rapport au client",
            meta: "Responsable : M. Alaoui",
            tone: "green",
          },
        ])
        .map((d, i) => (
          <div className="deadline deadline-full" key={i}>
            <div className={`date ${d.tone}`}>
              <b>{d.day}</b>
              <small>{d.month}</small>
            </div>
            <div className="deadline-copy">
              <strong>{d.title}</strong>
              <span>{d.meta}</span>
            </div>
            <i className={i === 0 ? "check red" : "check green"}>
              {i === 0 ? "Validation requise" : "Acquittée"}
            </i>
            <time>{d.time}</time>
            <button
              onClick={() => announceAction(`Échéance ouverte — ${d.title}`)}
            >
              ›
            </button>
          </div>
        ))}
    </div>
  );
}
function MatterFinance({ onPreinvoice }: { onPreinvoice: () => void }) {
  return (
    <div className="finance-grid">
      <div className="panel finance-kpi">
        <span>Temps saisi</span>
        <b>86,5 h</b>
        <small>72,0 h validées</small>
      </div>
      <div className="panel finance-kpi">
        <span>Production</span>
        <b>148 600 DH</b>
        <small>126 400 DH préfacturables</small>
      </div>
      <div className="panel finance-kpi">
        <span>Budget consommé</span>
        <b>63%</b>
        <small>Budget : 235 000 DH</small>
      </div>
      <div className="panel wide-finance">
        <div className="panel-title">
          <h2>Temps récent</h2>
          <div>
            <button onClick={() => announceAction("Saisie du temps ouverte")}>
              Saisir du temps
            </button>
            <button className="preinvoice-button" onClick={onPreinvoice}>
              Préparer la préfacture
            </button>
          </div>
        </div>
        {[
          ["S. Benali", "Préparation audience", "4,5 h", "Validé"],
          ["N. El Idrissi", "Analyse conclusions adverses", "3,0 h", "Validé"],
          ["M. Alaoui", "Classement des pièces", "2,5 h", "À valider"],
        ].map((x, i) => (
          <div className="time-row" key={i}>
            <span className="mini-avatar">
              {x[0]
                .split(" ")
                .map((y) => y[0])
                .join("")}
            </span>
            <b>{x[0]}</b>
            <span>{x[1]}</span>
            <strong>{x[2]}</strong>
            <i className={x[3] === "Validé" ? "check green" : "check amber"}>
              {x[3]}
            </i>
          </div>
        ))}
      </div>
    </div>
  );
}
function MatterBudget({ notify }: { notify: (x: string) => void }) {
  const [edit, setEdit] = useState(false);
  return (
    <div className="budget-view">
      <div className="budget-summary">
        <div className="panel">
          <span>Budget approuvé</span>
          <b>235 000 DH</b>
          <small>Convention au temps passé</small>
        </div>
        <div className="panel">
          <span>Réalisé</span>
          <b>148 600 DH</b>
          <small>63,2 % du budget</small>
        </div>
        <div className="panel">
          <span>Engagé</span>
          <b>32 400 DH</b>
          <small>Travaux planifiés & débours</small>
        </div>
        <div className="panel">
          <span>Reste disponible</span>
          <b>54 000 DH</b>
          <small>23,0 % du budget</small>
        </div>
        <div className="panel">
          <span>Facturé / encaissé</span>
          <b>85 880 / 80 000 DH</b>
          <small>Encaissement à 93,2 %</small>
        </div>
      </div>
      <div className="budget-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>Budget du dossier</h2>
            <button onClick={() => setEdit(!edit)}>
              {edit ? "Fermer" : "Réviser"} <span>›</span>
            </button>
          </div>
          <div className="budget-meter">
            <div>
              <span>Réalisé</span>
              <b>148 600 DH</b>
            </div>
            <div className="budget-track">
              <i style={{ width: "63.2%" }} />
              <em style={{ left: "77%" }}>Seuil 80%</em>
            </div>
            <footer>
              <span>0 DH</span>
              <span>Budget 235 000 DH</span>
            </footer>
          </div>
          {edit && (
            <div className="budget-form">
              <label>
                Budget révisé HT
                <input defaultValue="250 000" />
                <span>DH</span>
              </label>
              <label>
                Motif de révision
                <textarea defaultValue="Extension du périmètre après nouvelles conclusions adverses." />
              </label>
              <div>
                <button className="secondary" onClick={() => setEdit(false)}>
                  Annuler
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    notify(
                      "Révision soumise à validation et enregistrée dans l’audit",
                    );
                    setEdit(false);
                  }}
                >
                  Soumettre à validation
                </button>
              </div>
            </div>
          )}
          <div className="budget-lines">
            <div className="budget-line header">
              <span>Poste</span>
              <span>Prévu</span>
              <span>Réalisé</span>
              <span>Engagé</span>
              <span>Écart</span>
            </div>
            {[
              ["Honoraires", "190 000", "126 400", "28 000", "+35 600"],
              ["Débours judiciaires", "25 000", "14 200", "3 200", "+7 600"],
              ["Experts & conseils", "15 000", "5 500", "1 200", "+8 300"],
              ["Autres frais", "5 000", "2 500", "0", "+2 500"],
            ].map((x, i) => (
              <div className="budget-line" key={i}>
                <b>{x[0]}</b>
                {x.slice(1).map((v, j) => (
                  <span className={j === 3 ? "positive" : ""} key={j}>
                    {v} DH
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
        <aside>
          <div className="panel budget-alert">
            <i>!</i>
            <div>
              <span>ALERTE PRÉVISIONNELLE</span>
              <h3>Le seuil de 80 % sera atteint sous 18 jours</h3>
              <p>
                La production et les engagements projetés porteraient la
                consommation à 77 %. Une revue est recommandée avant la
                prochaine audience.
              </p>
              <button
                onClick={() =>
                  notify("Revue budgétaire ajoutée au plan de travail")
                }
              >
                Planifier une revue
              </button>
            </div>
          </div>
          <div className="panel budget-history">
            <PanelTitle title="Historique des validations" action="Audit" />
            {[
              ["Budget initial", "200 000 DH", "S. Benali • 12 mai"],
              ["Révision n°1", "235 000 DH", "Comité finance • 4 juillet"],
              ["Prochaine revue", "15 août 2026", "Planifiée"],
            ].map((x, i) => (
              <div key={i}>
                <i className={i < 2 ? "done" : ""}>{i < 2 ? "✓" : "○"}</i>
                <span>
                  <b>
                    {x[0]} — {x[1]}
                  </b>
                  <small>{x[2]}</small>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
function MatterRisks() {
  return (
    <div className="risk-grid">
      {[
        [
          "Échéance audience",
          "Élevé",
          "Préparation incomplète à J-1",
          "Sara Benali",
        ],
        [
          "Dépendance documentaire",
          "Moyen",
          "Deux pièces originales à confirmer",
          "Nadia El Idrissi",
        ],
        [
          "Exposition financière",
          "Moyen",
          "Pénalités contractuelles contestées",
          "Sara Benali",
        ],
        [
          "Relation client",
          "Faible",
          "Client informé et disponible",
          "Meryem Alaoui",
        ],
      ].map((x, i) => (
        <div className="panel risk-card" key={i}>
          <div>
            <span>RISQUE {i + 1}</span>
            <i className={`badge ${x[1]}`}>{x[1]}</i>
          </div>
          <h3>{x[0]}</h3>
          <p>{x[2]}</p>
          <small>Propriétaire : {x[3]}</small>
        </div>
      ))}
    </div>
  );
}
function IntakeModal({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const [step, setStep] = useState(1);
  const finish = () => {
    notify("Sollicitation enregistrée — contrôle de conflits requis");
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="intake-modal">
        <div className="modal-head">
          <div>
            <span>NOUVELLE SOLLICITATION</span>
            <h2>Préparer l’ouverture d’un dossier</h2>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="steps">
          <i className={step >= 1 ? "done" : ""}>
            1 <b>Demande</b>
          </i>
          <span />
          <i className={step >= 2 ? "done" : ""}>
            2 <b>Parties</b>
          </i>
          <span />
          <i className={step >= 3 ? "done" : ""}>
            3 <b>Contrôle</b>
          </i>
        </div>
        {step === 1 && (
          <div className="form-grid">
            <label>
              Client / prospect
              <input defaultValue="Société Démo" />
            </label>
            <label>
              Urgence
              <select defaultValue="normal">
                <option value="normal">Normale</option>
                <option>Élevée</option>
                <option>Critique</option>
              </select>
            </label>
            <label className="full">
              Objet de la demande
              <textarea defaultValue="Conseil et représentation dans un différend commercial." />
            </label>
            <label>
              Domaine
              <select>
                <option>Contentieux commercial</option>
                <option>Conseil corporate</option>
                <option>Droit social</option>
              </select>
            </label>
            <label>
              Responsable pressenti
              <select>
                <option>Sara Benali</option>
                <option>Nadia El Idrissi</option>
              </select>
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="form-grid">
            <label className="full">
              Partie adverse
              <input placeholder="Dénomination ou nom complet" />
            </label>
            <label>
              Rôle
              <select>
                <option>Défendeur</option>
                <option>Demandeur</option>
                <option>Tiers</option>
              </select>
            </label>
            <label>
              Identifiant
              <input placeholder="ICE, CIN ou autre" />
            </label>
            <div className="form-note full">
              Ajoutez toutes les parties connues. Le contrôle recherchera les
              correspondances sans révéler le contenu des dossiers restreints.
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="conflict-ready">
            <i>◇</i>
            <h3>Contrôle de conflits requis</h3>
            <p>
              La sollicitation sera enregistrée, puis soumise à un contrôle
              avant toute ouverture de dossier.
            </p>
            <div>
              <span>Client / prospect</span>
              <b>Société Démo</b>
            </div>
            <div>
              <span>Décision attendue</span>
              <b>Associée responsable</b>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button
            className="secondary"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? "Annuler" : "Précédent"}
          </button>
          <button
            className="primary"
            onClick={step === 3 ? finish : () => setStep(step + 1)}
          >
            {step === 3 ? "Enregistrer et contrôler" : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HearingModal({
  mode,
  onClose,
  notify,
}: {
  mode: "prepare" | "report";
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const [checks, setChecks] = useState([true, true, false, false]);
  const toggle = (i: number) =>
    setChecks(checks.map((x, j) => (i === j ? !x : x)));
  const save = () => {
    notify(
      mode === "prepare"
        ? "Préparation d’audience enregistrée"
        : "Audience régularisée — nouvelles actions créées",
    );
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="workflow-modal">
        <div className="modal-head">
          <div>
            <span>
              {mode === "prepare"
                ? "PRÉPARATION D’AUDIENCE"
                : "COMPTE RENDU APRÈS AUDIENCE"}
            </span>
            <h2>
              {mode === "prepare"
                ? "Audience du 1er août 2026"
                : "Régulariser l’audience du 25 juillet"}
            </h2>
            <p>Tribunal de commerce • 4e chambre • Dossier IL-2026-0091</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        {mode === "prepare" ? (
          <div className="hearing-workflow">
            <div className="hearing-brief">
              <div>
                <span>Avocate</span>
                <b>Sara Benali</b>
              </div>
              <div>
                <span>Suppléante</span>
                <b>Nadia El Idrissi</b>
              </div>
              <div>
                <span>Heure</span>
                <b>09:30</b>
              </div>
              <div>
                <span>Salle</span>
                <b>4</b>
              </div>
            </div>
            <h3>Checklist de préparation</h3>
            {[
              "Conclusions définitives validées",
              "Bordereau de pièces vérifié",
              "Originaux préparés pour présentation",
              "Instructions client confirmées",
            ].map((x, i) => (
              <button
                className="checklist-row"
                key={x}
                onClick={() => toggle(i)}
              >
                <i className={checks[i] ? "checked" : ""}>
                  {checks[i] ? "✓" : ""}
                </i>
                <span>{x}</span>
                <small>{i < 2 ? "Validé aujourd’hui" : "À compléter"}</small>
              </button>
            ))}
            <div className="form-grid hearing-fields">
              <label>
                Objectif de l’audience
                <textarea defaultValue="Obtenir la clôture de la mise en état après dépôt de nos conclusions." />
              </label>
              <label>
                Points de vigilance
                <textarea defaultValue="Vérifier la communication des pièces 17 et 18 par la partie adverse." />
              </label>
            </div>
          </div>
        ) : (
          <div className="report-flow">
            <div className="form-grid">
              <label>
                Présence
                <select>
                  <option>Présent(e)</option>
                  <option>Représenté(e)</option>
                  <option>Absent(e)</option>
                </select>
              </label>
              <label>
                Résultat
                <select>
                  <option>Renvoi</option>
                  <option>Mise en délibéré</option>
                  <option>Clôture</option>
                  <option>Décision rendue</option>
                </select>
              </label>
              <label>
                Prochaine date
                <input type="date" defaultValue="2026-08-18" />
              </label>
              <label>
                Motif
                <select>
                  <option>Communication de nouvelles pièces</option>
                  <option>Conclusions en réponse</option>
                  <option>Décision du tribunal</option>
                </select>
              </label>
              <label className="full">
                Compte rendu
                <textarea defaultValue="La partie adverse a communiqué deux nouvelles pièces. Renvoi accordé pour réponse et clôture envisagée à la prochaine audience." />
              </label>
            </div>
            <div className="generated-actions">
              <h3>Actions proposées automatiquement</h3>
              <label>
                <input type="checkbox" defaultChecked /> Analyser les nouvelles
                pièces — N. El Idrissi — 4 août
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Préparer les
                conclusions en réponse — S. Benali — 12 août
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Informer le client — M.
                Alaoui — aujourd’hui
              </label>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" onClick={save}>
            {mode === "prepare"
              ? "Enregistrer la préparation"
              : "Valider le compte rendu"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeadlineModal({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const [step, setStep] = useState(1);
  const finish = () => {
    notify("Échéance créée — validation du responsable requise");
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="workflow-modal deadline-modal">
        <div className="modal-head">
          <div>
            <span>ÉCHÉANCE CRITIQUE</span>
            <h2>Créer une échéance contrôlée</h2>
            <p>
              Le système assiste le calcul ; la date reste une proposition
              jusqu’à validation humaine.
            </p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="steps deadline-steps">
          <i className={step >= 1 ? "done" : ""}>
            1 <b>Source</b>
          </i>
          <span />
          <i className={step >= 2 ? "done" : ""}>
            2 <b>Calcul</b>
          </i>
          <span />
          <i className={step >= 3 ? "done" : ""}>
            3 <b>Responsables</b>
          </i>
          <span />
          <i className={step >= 4 ? "done" : ""}>
            4 <b>Validation</b>
          </i>
        </div>
        {step === 1 && (
          <div className="form-grid workflow-body">
            <label className="full">
              Événement déclencheur
              <select>
                <option>Audience / décision du 1er août 2026</option>
                <option>Notification reçue</option>
                <option>Acte signifié</option>
                <option>Date contractuelle</option>
              </select>
            </label>
            <label>
              Date de l’événement
              <input type="date" defaultValue="2026-08-01" />
            </label>
            <label>
              Source
              <input defaultValue="Compte rendu d’audience" />
            </label>
            <label className="full">
              Objet de l’échéance
              <input defaultValue="Dépôt des conclusions en réponse" />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="calculation">
            <div className="rule-card">
              <span>RÈGLE VERSIONNÉE</span>
              <h3>Délai de réponse — règle interne R-PRC-014 v2.1</h3>
              <p>
                10 jours calendaires après l’événement, report au premier jour
                ouvrable suivant.
              </p>
            </div>
            <div className="calc-line">
              <span>Événement</span>
              <b>01 août 2026</b>
              <i>＋ 10 jours</i>
              <strong>11 août 2026</strong>
            </div>
            <div className="warning-box">
              ⚠ Proposition calculée selon les hypothèses affichées. Une
              personne habilitée doit confirmer la date.
            </div>
            <label className="hypothesis">
              <input type="checkbox" defaultChecked /> Le calendrier Maroc 2026
              et les jours fériés applicables ont été vérifiés.
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="form-grid workflow-body">
            <label>
              Responsable
              <select>
                <option>Sara Benali</option>
                <option>Nadia El Idrissi</option>
              </select>
            </label>
            <label>
              Suppléante
              <select>
                <option>Nadia El Idrissi</option>
                <option>Meryem Alaoui</option>
              </select>
            </label>
            <label>
              Premier rappel
              <select>
                <option>J-7</option>
                <option>J-5</option>
                <option>J-3</option>
              </select>
            </label>
            <label>
              Escalade
              <select>
                <option>J-3 si non acquittée</option>
                <option>J-2 si non acquittée</option>
                <option>J-1 systématique</option>
              </select>
            </label>
            <div className="form-note full">
              En l’absence d’acquittement, l’alerte sera transmise à la
              suppléante puis à l’associée gérante.
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="validation-card">
            <i>✓</i>
            <h3>Proposition prête à valider</h3>
            <div>
              <span>Échéance proposée</span>
              <b>11 août 2026 • 18:00</b>
            </div>
            <div>
              <span>Responsable / suppléante</span>
              <b>S. Benali / N. El Idrissi</b>
            </div>
            <div>
              <span>Règle et source</span>
              <b>R-PRC-014 v2.1 • Audience du 1er août</b>
            </div>
            <label>
              <input type="checkbox" /> Je confirme la date, la source et les
              hypothèses de calcul.
            </label>
          </div>
        )}
        <div className="modal-actions">
          <button
            className="secondary"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? "Annuler" : "Précédent"}
          </button>
          <button
            className="primary"
            onClick={step === 4 ? finish : () => setStep(step + 1)}
          >
            {step === 4 ? "Soumettre à validation" : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentModal({
  mode,
  onClose,
  notify,
}: {
  mode: "add" | "detail";
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const [step, setStep] = useState(1);
  const finish = () => {
    notify(
      mode === "add"
        ? "Document classé et version initiale créée"
        : "Nouvelle version officielle validée",
    );
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="workflow-modal document-modal">
        <div className="modal-head">
          <div>
            <span>
              {mode === "add" ? "CLASSEMENT DOCUMENTAIRE" : "FICHE DOCUMENT"}
            </span>
            <h2>
              {mode === "add"
                ? "Ajouter et qualifier un document"
                : "Conclusions — version officielle"}
            </h2>
            <p>
              {mode === "add"
                ? "Le fichier, ses métadonnées et sa qualification juridique restent distincts."
                : "DOC-IL-0091-028 • Dossier IL-2026-0091"}
            </p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        {mode === "add" ? (
          <>
            <div className="steps">
              <i className={step >= 1 ? "done" : ""}>
                1 <b>Fichier</b>
              </i>
              <span />
              <i className={step >= 2 ? "done" : ""}>
                2 <b>Qualification</b>
              </i>
              <span />
              <i className={step >= 3 ? "done" : ""}>
                3 <b>Contrôle</b>
              </i>
            </div>
            {step === 1 && (
              <div className="upload-zone">
                <i>⇧</i>
                <h3>Déposer le document</h3>
                <p>PDF, DOCX, XLSX ou image • 25 Mo maximum</p>
                <button
                  className="secondary"
                  onClick={() =>
                    announceAction("Fichier de démonstration sélectionné")
                  }
                >
                  Choisir un fichier fictif
                </button>
                <div>
                  <span>conclusions_atlas_v5.pdf</span>
                  <b>2,4 Mo • Analyse antivirus simulée : conforme</b>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="form-grid workflow-body">
                <label>
                  Titre
                  <input defaultValue="Conclusions en réponse" />
                </label>
                <label>
                  Catégorie
                  <select>
                    <option>Acte de procédure</option>
                    <option>Correspondance</option>
                    <option>Pièce</option>
                    <option>Note interne</option>
                  </select>
                </label>
                <label>
                  Dossier
                  <select>
                    <option>IL-2026-0091 — Atlas c/ Maroc Distribution</option>
                  </select>
                </label>
                <label>
                  Statut
                  <select>
                    <option>Brouillon contrôlé</option>
                    <option>Version officielle</option>
                    <option>Copie</option>
                  </select>
                </label>
                <label>
                  Confidentialité
                  <select>
                    <option>Équipe du dossier</option>
                    <option>Associés uniquement</option>
                    <option>Accès nominatif</option>
                  </select>
                </label>
                <label>
                  Original physique
                  <select>
                    <option>Non</option>
                    <option>Oui — à localiser</option>
                  </select>
                </label>
                <label className="full checkbox-label">
                  <input type="checkbox" defaultChecked /> Qualifier également
                  ce document comme pièce du dossier.
                </label>
              </div>
            )}
            {step === 3 && (
              <div className="document-review">
                <div className="file-preview">
                  <span>PDF</span>
                  <b>conclusions_atlas_v5.pdf</b>
                  <small>Empreinte SHA-256 enregistrée • 2,4 Mo</small>
                </div>
                <div className="review-list">
                  <div>
                    <span>Version</span>
                    <b>v1 — brouillon contrôlé</b>
                  </div>
                  <div>
                    <span>Accès</span>
                    <b>Équipe du dossier</b>
                  </div>
                  <div>
                    <span>Qualification</span>
                    <b>Acte de procédure + pièce n° 19</b>
                  </div>
                  <div>
                    <span>Conservation</span>
                    <b>Politique dossier contentieux</b>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="secondary"
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
              >
                {step === 1 ? "Annuler" : "Précédent"}
              </button>
              <button
                className="primary"
                onClick={step === 3 ? finish : () => setStep(step + 1)}
              >
                {step === 3 ? "Classer le document" : "Continuer"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="document-detail-body">
              <div className="doc-hero">
                <span>PDF</span>
                <div>
                  <h3>Conclusions — version officielle</h3>
                  <p>
                    Version 4 • Validée par Sara Benali le 31 juillet à 09:42
                  </p>
                </div>
                <i className="check green">Officiel</i>
              </div>
              <div className="version-track">
                <h3>Historique des versions</h3>
                {[
                  ["v4", "Version officielle", "S. Benali", "31 juil. • 09:42"],
                  [
                    "v3",
                    "Corrections juridiques",
                    "N. El Idrissi",
                    "30 juil. • 16:14",
                  ],
                  ["v2", "Révision interne", "S. Benali", "29 juil. • 11:20"],
                  ["v1", "Document initial", "M. Alaoui", "28 juil. • 14:08"],
                ].map((x, i) => (
                  <div key={i}>
                    <b>{x[0]}</b>
                    <span>{x[1]}</span>
                    <small>
                      {x[2]} • {x[3]}
                    </small>
                    {i === 0 && <i>Version active</i>}
                  </div>
                ))}
              </div>
              <div className="evidence-box">
                <h3>Preuve de communication</h3>
                <p>
                  Transmis au client via le portail sécurisé le 31 juillet à
                  10:05. Accusé de téléchargement reçu à 10:22.
                </p>
                <button
                  className="secondary"
                  onClick={() =>
                    announceAction("Preuve de communication ouverte")
                  }
                >
                  Voir la preuve
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary" onClick={onClose}>
                Fermer
              </button>
              <button className="primary" onClick={finish}>
                ＋ Créer une nouvelle version
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreinvoiceModal({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const [step, setStep] = useState(1);
  const finish = () => {
    notify(
      "Préfacture approuvée — transfert idempotent préparé pour Integer e‑Invoice",
    );
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="workflow-modal preinvoice-modal">
        <div className="modal-head">
          <div>
            <span>PRÉFACTURATION</span>
            <h2>Préparer les éléments facturables</h2>
            <p>
              Integer Legal contrôle les éléments métier. Integer e‑Invoice
              produira la facture officielle.
            </p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="steps">
          <i className={step >= 1 ? "done" : ""}>
            1 <b>Sélection</b>
          </i>
          <span />
          <i className={step >= 2 ? "done" : ""}>
            2 <b>Ajustements</b>
          </i>
          <span />
          <i className={step >= 3 ? "done" : ""}>
            3 <b>Approbation</b>
          </i>
          <span />
          <i className={step >= 4 ? "done" : ""}>
            4 <b>Transfert</b>
          </i>
        </div>
        {step === 1 && (
          <div className="billing-body">
            <div className="billing-summary">
              <div>
                <span>Période</span>
                <b>01–31 juillet 2026</b>
              </div>
              <div>
                <span>Convention</span>
                <b>Temps passé • Tarifs par intervenant</b>
              </div>
            </div>
            <div className="billing-lines">
              <div className="billing-line header">
                <span>Élément</span>
                <span>Qté</span>
                <span>Tarif</span>
                <span>Montant</span>
                <span></span>
              </div>
              {[
                ["Temps Sara Benali", "24,0 h", "1 500 DH", "36 000 DH"],
                ["Temps Nadia El Idrissi", "31,5 h", "1 200 DH", "37 800 DH"],
                ["Temps Meryem Alaoui", "16,5 h", "750 DH", "12 375 DH"],
                ["Frais et débours", "—", "—", "4 225 DH"],
              ].map((x, i) => (
                <label className="billing-line" key={i}>
                  <span>
                    <input type="checkbox" defaultChecked />
                    {x[0]}
                  </span>
                  <span>{x[1]}</span>
                  <span>{x[2]}</span>
                  <b>{x[3]}</b>
                  <button
                    onClick={() => announceAction("Options de ligne ouvertes")}
                  >
                    ⋮
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="billing-body">
            <div className="adjustment">
              <label>
                Remise commerciale
                <input type="number" defaultValue="5" />
                <span>%</span>
              </label>
              <label>
                Motif obligatoire
                <textarea defaultValue="Ajustement convenu avec l’associée responsable au regard du budget du dossier." />
              </label>
            </div>
            <div className="billing-totals">
              <div>
                <span>Sous-total</span>
                <b>90 400 DH</b>
              </div>
              <div>
                <span>Remise 5%</span>
                <b>− 4 520 DH</b>
              </div>
              <div className="total">
                <span>Total HT proposé</span>
                <b>85 880 DH</b>
              </div>
            </div>
            <div className="warning-box">
              Toute correction est motivée et conservée dans l’audit. Les taxes
              et mentions fiscales seront déterminées par Integer e‑Invoice.
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="approval-flow">
            <div className="approval-card">
              <span>PRÉFACTURE PF-IL-2026-0078</span>
              <strong>85 880 DH HT</strong>
              <p>Société Atlas • Dossier IL-2026-0091 • Juillet 2026</p>
            </div>
            <div className="approval-chain">
              <div className="done">
                <i>✓</i>
                <span>
                  <b>Contrôle des temps</b>
                  <small>Nadia El Idrissi • 31 juillet, 11:05</small>
                </span>
              </div>
              <div className="current">
                <i>2</i>
                <span>
                  <b>Approbation associée</b>
                  <small>Sara Benali • Action requise</small>
                </span>
              </div>
              <div>
                <i>3</i>
                <span>
                  <b>Transfert e‑Invoice</b>
                  <small>Après approbation</small>
                </span>
              </div>
            </div>
            <label className="approval-check">
              <input type="checkbox" /> J’approuve les éléments métier et les
              ajustements de cette préfacture.
            </label>
          </div>
        )}
        {step === 4 && (
          <div className="transfer-flow">
            <i>↗</i>
            <h3>Prêt pour Integer e‑Invoice</h3>
            <p>
              Un contrat d’intégration versionné transmettra uniquement les
              données approuvées. Aucun accès direct aux tables n’est autorisé.
            </p>
            <div>
              <span>Identifiant idempotent</span>
              <b>IL-PF-2026-0078-v1</b>
            </div>
            <div>
              <span>Statut cible</span>
              <b>Brouillon de facture à contrôler</b>
            </div>
            <div>
              <span>Traçabilité</span>
              <b>Corrélation et audit activés</b>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button
            className="secondary"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? "Annuler" : "Précédent"}
          </button>
          <button
            className="primary"
            onClick={step === 4 ? finish : () => setStep(step + 1)}
          >
            {step === 1
              ? "Contrôler la sélection"
              : step === 2
                ? "Soumettre à approbation"
                : step === 3
                  ? "Approuver"
                  : "Transférer à e‑Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortalView({ notify }: { notify: (x: string) => void }) {
  const [clientMode, setClientMode] = useState(false);
  if (clientMode)
    return <ClientPortal onExit={() => setClientMode(false)} notify={notify} />;
  return (
    <div className="portal-admin">
      <div className="portal-banner">
        <div>
          <span>ESPACE CLIENT SÉCURISÉ</span>
          <h2>Société Atlas</h2>
          <p>
            Portail actif • 3 utilisateurs autorisés • dernière connexion
            aujourd’hui à 10:22
          </p>
        </div>
        <button className="primary" onClick={() => setClientMode(true)}>
          Aperçu côté client ↗
        </button>
      </div>
      <div className="portal-admin-grid">
        <div className="panel">
          <PanelTitle title="Contenu publié" action="Gérer les publications" />
          {[
            ["Chronologie du dossier", "6 événements publiés", "green"],
            ["Documents partagés", "8 documents • 2 à valider", "blue"],
            ["Demandes au client", "1 demande en attente", "amber"],
            ["Factures & règlements", "3 factures depuis e‑Invoice", "violet"],
          ].map((x, i) => (
            <div className="portal-setting" key={i}>
              <i className={x[2]} />
              <div>
                <b>{x[0]}</b>
                <span>{x[1]}</span>
              </div>
              <button
                onClick={() =>
                  announceAction(`Configuration ouverte — ${x[0]}`)
                }
              >
                Configurer
              </button>
            </div>
          ))}
        </div>
        <div className="panel">
          <PanelTitle title="Accès nominatifs" action="Inviter" />
          {[
            ["AK", "Amine Karim", "Direction générale", "Actif"],
            ["SH", "Salma Haddad", "Direction financière", "Actif"],
            ["OY", "Omar Yassine", "Conseil interne", "Suspendu"],
          ].map((x, i) => (
            <div className="access-row" key={i}>
              <span className={`mini-avatar a${i}`}>{x[0]}</span>
              <div>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
              <i className={x[3] === "Actif" ? "check green" : "check amber"}>
                {x[3]}
              </i>
              <button
                onClick={() =>
                  announceAction(`Options d’accès ouvertes — ${x[1]}`)
                }
              >
                ⋮
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="panel portal-permissions">
        <PanelTitle title="Périmètre de publication" action="Modifier" />
        <div className="permission-grid">
          {[
            ["Événements de procédure", "Publication manuelle"],
            ["Documents", "Version explicitement sélectionnée"],
            ["Messages", "Conversation liée au dossier"],
            ["Instructions", "Accusé et version horodatés"],
            ["Facturation", "Lecture depuis Integer e‑Invoice"],
            ["Données internes", "Jamais publiées"],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
              <i className={i === 5 ? "lock" : "check"}>
                {i === 5 ? "Verrouillé" : "Actif"}
              </i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientPortal({
  onExit,
  notify,
}: {
  onExit: () => void;
  notify: (x: string) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [requestOpen, setRequestOpen] = useState(false);
  return (
    <div className="client-portal">
      <div className="client-top">
        <div className="client-brand">
          <div className="brand-mark">IL</div>
          <div>
            <b>Cabinet Benali</b>
            <span>Espace client sécurisé</span>
          </div>
        </div>
        <div>
          <button onClick={() => notify("Langue du portail : français")}>
            FR
          </button>
          <button onClick={() => notify("لغة البوابة: العربية")}>AR</button>
          <button onClick={() => notify("Portal language: English")}>EN</button>
          <span className="client-avatar">AK</span>
          <button onClick={onExit}>Quitter l’aperçu ×</button>
        </div>
      </div>
      <div className="client-welcome">
        <div>
          <span>DOSSIER IL-2026-0091</span>
          <h1>Atlas c/ Maroc Distribution</h1>
          <p>
            Bienvenue, Amine Karim. Voici les informations publiées par votre
            cabinet.
          </p>
        </div>
        <i>Mis à jour il y a 18 min</i>
      </div>
      <div className="client-tabs">
        {[
          ["overview", "Synthèse"],
          ["documents", "Documents"],
          ["messages", "Messages"],
          ["billing", "Factures"],
        ].map((x) => (
          <button
            className={tab === x[0] ? "active" : ""}
            key={x[0]}
            onClick={() => setTab(x[0])}
          >
            {x[1]}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div className="client-grid-layout">
          <section>
            <div className="client-card-main">
              <div className="client-next">
                <span>PROCHAINE ÉTAPE</span>
                <div>
                  <b>01</b>
                  <small>AOÛT</small>
                </div>
                <h3>Audience de mise en état</h3>
                <p>Votre avocat vous informera du résultat après l’audience.</p>
              </div>
              <div className="client-actions">
                <h3>Actions attendues</h3>
                <button onClick={() => setRequestOpen(true)}>
                  <i>⇧</i>
                  <div>
                    <b>Déposer les pièces commerciales 2025</b>
                    <span>Demandé par Meryem Alaoui • avant le 5 août</span>
                  </div>
                  <em>Action requise</em>
                </button>
                <button
                  onClick={() =>
                    notify("Version officielle ouverte en lecture")
                  }
                >
                  <i>✓</i>
                  <div>
                    <b>Valider le projet de courrier</b>
                    <span>Version 3 • publié aujourd’hui à 09:20</span>
                  </div>
                  <em>À valider</em>
                </button>
              </div>
            </div>
            <div className="client-timeline">
              <h3>Dernières nouvelles</h3>
              {[
                [
                  "Aujourd’hui, 10:05",
                  "Nouveau document partagé",
                  "Conclusions — version officielle",
                ],
                [
                  "30 juillet, 17:40",
                  "Message de votre cabinet",
                  "Préparation de l’audience du 1er août",
                ],
                [
                  "25 juillet, 11:15",
                  "Audience reportée",
                  "Nouvelle date : 1er août à 09:30",
                ],
              ].map((x, i) => (
                <div key={i}>
                  <time>{x[0]}</time>
                  <i />
                  <span>
                    <b>{x[1]}</b>
                    <small>{x[2]}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <aside>
            <div className="client-contact">
              <span className="client-lawyer">SB</span>
              <h3>Sara Benali</h3>
              <p>Avocate responsable du dossier</p>
              <button onClick={() => notify("Conversation sécurisée ouverte")}>
                Envoyer un message
              </button>
            </div>
            <div className="client-security">
              ⌾ Connexion sécurisée
              <br />
              <span>Vos accès et téléchargements sont tracés.</span>
            </div>
          </aside>
        </div>
      )}
      {tab === "documents" && (
        <div className="client-docs">
          {[
            [
              "PDF",
              "Conclusions — version officielle",
              "Publié aujourd’hui",
              "Télécharger",
            ],
            ["DOCX", "Projet de courrier v3", "Validation requise", "Valider"],
            [
              "PDF",
              "Compte rendu d’audience",
              "25 juillet 2026",
              "Télécharger",
            ],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <div>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
              <button onClick={() => notify(`${x[3]} — action tracée`)}>
                {x[3]}
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "messages" && (
        <div className="client-messages">
          <div>
            <span>Cabinet Benali</span>
            <p>
              Bonjour Monsieur Karim, nous finalisons la préparation de
              l’audience. Merci de déposer les pièces demandées avant le 5 août.
            </p>
            <small>Aujourd’hui, 09:12</small>
          </div>
          <label>
            <textarea placeholder="Écrire un message sécurisé…" />
            <button
              className="primary"
              onClick={() => notify("Message envoyé et rattaché au dossier")}
            >
              Envoyer
            </button>
          </label>
        </div>
      )}
      {tab === "billing" && (
        <div className="client-docs">
          {[
            ["FAC", "Facture INV-2026-00421", "42 500 DH • Payée", "Voir"],
            ["FAC", "Facture INV-2026-00318", "38 200 DH • Payée", "Voir"],
            ["DEV", "Provision demandée", "25 000 DH • En attente", "Régler"],
          ].map((x, i) => (
            <div key={i}>
              <span>{x[0]}</span>
              <div>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
              <button onClick={() => notify(`${x[1]} — ${x[3]}`)}>
                {x[3]}
              </button>
            </div>
          ))}
        </div>
      )}
      {requestOpen && (
        <PortalRequestModal
          onClose={() => setRequestOpen(false)}
          notify={notify}
        />
      )}
    </div>
  );
}

function PortalRequestModal({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (x: string) => void;
}) {
  const finish = () => {
    notify("Pièces déposées — preuve et notification enregistrées");
    onClose();
  };
  return (
    <div className="modal-backdrop">
      <div className="intake-modal portal-upload">
        <div className="modal-head">
          <div>
            <span>DÉPÔT SÉCURISÉ</span>
            <h2>Pièces commerciales 2025</h2>
            <p>Demande REQ-IL-0042 • liée au dossier IL-2026-0091</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="upload-zone">
          <i>⇧</i>
          <h3>Déposer les pièces demandées</h3>
          <p>
            Les fichiers seront chiffrés, contrôlés et transmis uniquement à
            l’équipe du dossier.
          </p>
          <button
            className="secondary"
            onClick={() =>
              announceAction("Fichiers de démonstration sélectionnés")
            }
          >
            Choisir des fichiers fictifs
          </button>
          <div>
            <span>contrats_distribution_2025.pdf</span>
            <b>Prêt • 4,8 Mo</b>
          </div>
        </div>
        <label className="upload-comment">
          Commentaire
          <textarea defaultValue="Veuillez trouver les contrats et annexes demandés." />
        </label>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" onClick={finish}>
            Déposer et notifier le cabinet
          </button>
        </div>
      </div>
    </div>
  );
}

const auditEvents = [
  {
    category: "Documents",
    date: "31 juil. • 10:22",
    actor: "Amine Karim",
    action: "Téléchargement",
    object: "Conclusions v4",
    result: "Autorisé",
    correlation: "COR-8F21",
    source: "Portail client • 196.70.18.24",
    reason: "Document publié et accessible au profil client autorisé.",
  },
  {
    category: "Portail",
    date: "31 juil. • 10:05",
    actor: "Sara Benali",
    action: "Publication portail",
    object: "Conclusions v4",
    result: "Succès",
    correlation: "COR-8E98",
    source: "Integer Legal • Session associée",
    reason: "Version officielle explicitement sélectionnée pour publication.",
  },
  {
    category: "Documents",
    date: "31 juil. • 09:42",
    actor: "Sara Benali",
    action: "Version officielle",
    object: "DOC-IL-0091-028",
    result: "Succès",
    correlation: "COR-8D72",
    source: "Dossier IL-2026-0091",
    reason: "Validation de la version 4 avec empreinte documentaire conservée.",
  },
  {
    category: "Échéances",
    date: "31 juil. • 09:18",
    actor: "Nadia El Idrissi",
    action: "Modification échéance",
    object: "DL-IL-00182",
    result: "Validée",
    correlation: "COR-8C44",
    source: "Dossier IL-2026-0087",
    reason: "Nouvelle date motivée et approuvée par la responsable du dossier.",
  },
  {
    category: "Accès",
    date: "31 juil. • 08:51",
    actor: "Compte support",
    action: "Accès dossier restreint",
    object: "IL-2026-0064",
    result: "Refusé",
    correlation: "COR-8B17",
    source: "Console support • 41.251.86.12",
    reason: "Le compte ne figure pas dans la liste nominative du dossier.",
  },
  {
    category: "Accès",
    date: "30 juil. • 17:36",
    actor: "Youssef Amrani",
    action: "Consultation dossier",
    object: "IL-2026-0064",
    result: "Autorisé",
    correlation: "COR-89F2",
    source: "Integer Legal • Session avocat",
    reason: "Utilisateur membre de l’équipe active du dossier.",
  },
  {
    category: "Portail",
    date: "30 juil. • 16:14",
    actor: "Horizon Capital",
    action: "Message client",
    object: "MSG-PORT-00418",
    result: "Reçu",
    correlation: "COR-88C6",
    source: "Portail client sécurisé",
    reason: "Message chiffré remis à l’équipe du dossier Horizon.",
  },
] as const;

function downloadAuditFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportAuditEvents(events: readonly (typeof auditEvents)[number][]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = events.map((event) =>
    [event.date, event.actor, event.category, event.action, event.object, event.result, event.correlation, event.source, event.reason]
      .map(escape)
      .join(";"),
  );
  downloadAuditFile(
    "integer-legal-journal-audit.csv",
    `\uFEFF${[
      "Date;Acteur;Catégorie;Action;Objet;Résultat;Corrélation;Source;Justification",
      ...rows,
    ].join("\n")}`,
    "text/csv;charset=utf-8",
  );
}

function AuditView() {
  const [filter, setFilter] = useState("Tous");
  const [auditQuery, setAuditQuery] = useState("");
  const [selectedAuditStat, setSelectedAuditStat] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof auditEvents)[number] | null
  >(null);
  const categoryEvents =
    filter === "Tous"
      ? auditEvents
      : auditEvents.filter((event) => event.category === filter);
  const normalizedQuery = auditQuery.trim().toLocaleLowerCase("fr");
  const visibleEvents = normalizedQuery
    ? categoryEvents.filter((event) =>
        [event.actor, event.action, event.object, event.correlation, event.result].some(
          (value) => value.toLocaleLowerCase("fr").includes(normalizedQuery),
        ),
      )
    : categoryEvents;
  const auditFilters = ["Tous", "Accès", "Documents", "Échéances", "Portail"];
  return (
    <div className="audit-view">
      <div className="audit-stats">
        {[
          ["Consultations sensibles", "128", "Aujourd’hui"],
          ["Téléchargements", "34", "7 derniers jours"],
          ["Actions refusées", "3", "30 derniers jours"],
          ["Accès d’urgence", "0", "90 derniers jours"],
        ].map((x, i) => (
          <button
            type="button"
            className="panel"
            key={i}
            onClick={() => setSelectedAuditStat(x[0])}
          >
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
            <em>Voir l’analyse ›</em>
          </button>
        ))}
      </div>
      <div className="panel audit-panel">
        <div className="audit-toolbar">
          <div>
            <h2>Événements récents</h2>
            <p>Journal immuable des actions sensibles</p>
          </div>
          <div>
            {auditFilters.map((x) => (
              <button
                type="button"
                className={filter === x ? "active" : ""}
                key={x}
                aria-pressed={filter === x}
                onClick={() => {
                  setFilter(x);
                  setSelectedEvent(null);
                }}
              >
                {x}
                <b>
                  {x === "Tous"
                    ? auditEvents.length
                    : auditEvents.filter((event) => event.category === x).length}
                </b>
              </button>
            ))}
          </div>
        </div>
        <div className="audit-filter-feedback" aria-live="polite">
          <span>
            Vue active : <b>{filter}</b>
          </span>
          <small>
            {visibleEvents.length} événement{visibleEvents.length > 1 ? "s" : ""}
            {" "}affiché{visibleEvents.length > 1 ? "s" : ""}
          </small>
        </div>
        <div className="audit-search-tools">
          <label>
            <span>⌕</span>
            <input
              value={auditQuery}
              onChange={(event) => setAuditQuery(event.target.value)}
              placeholder="Rechercher un acteur, un objet ou une corrélation…"
            />
            {auditQuery && (
              <button type="button" onClick={() => setAuditQuery("")}>×</button>
            )}
          </label>
          <button
            type="button"
            className="secondary"
            disabled={visibleEvents.length === 0}
            onClick={() => exportAuditEvents(visibleEvents)}
          >
            ⇩ Exporter la vue ({visibleEvents.length})
          </button>
        </div>
        <div className="audit-table" key={filter}>
          <div className="audit-row header">
            <span>Date / acteur</span>
            <span>Action</span>
            <span>Objet</span>
            <span>Résultat</span>
            <span>Corrélation</span>
          </div>
          {visibleEvents.map((event) => (
            <div
              className="audit-row clickable"
              key={event.correlation}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEvent(event)}
              onKeyDown={(key) => {
                if (key.key === "Enter" || key.key === " ") {
                  key.preventDefault();
                  setSelectedEvent(event);
                }
              }}
            >
              <span>
                <b>{event.date}</b>
                <small>{event.actor}</small>
              </span>
              <span>{event.action}</span>
              <span>{event.object}</span>
              <span>
                <i
                  className={
                    event.result === "Refusé" ? "check red" : "check green"
                  }
                >
                  {event.result}
                </i>
              </span>
              <span>
                <code>{event.correlation}</code>
                <button
                  type="button"
                  aria-label={`Ouvrir ${event.action}`}
                  onClick={(click) => {
                    click.stopPropagation();
                    setSelectedEvent(event);
                  }}
                >
                  ›
                </button>
              </span>
            </div>
          ))}
          {visibleEvents.length === 0 && (
            <div className="audit-empty">
              <b>Aucun événement trouvé</b>
              <span>Modifiez la recherche ou choisissez une autre catégorie.</span>
              <button type="button" onClick={() => setAuditQuery("")}>Effacer la recherche</button>
            </div>
          )}
        </div>
      </div>
      <div className="audit-notice">
        Le journal métier n’est pas désactivable par les utilisateurs du
        cabinet. Les événements sont horodatés, corrélés et soumis aux règles de
        conservation.
      </div>
      {selectedEvent && (
        <AuditEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      {selectedAuditStat && (
        <AuditStatModal
          stat={selectedAuditStat}
          onClose={() => setSelectedAuditStat(null)}
          onShowEvents={(nextFilter) => {
            setFilter(nextFilter);
            setAuditQuery("");
            setSelectedAuditStat(null);
          }}
        />
      )}
    </div>
  );
}

function AuditStatModal({
  stat,
  onClose,
  onShowEvents,
}: {
  stat: string;
  onClose: () => void;
  onShowEvents: (filter: string) => void;
}) {
  const data = {
    "Consultations sensibles": {
      value: "128",
      trend: "+8 % vs. moyenne 30 jours",
      filter: "Accès",
      rows: [
        ["Dossiers à accès nominatif", "74", "58 %"],
        ["Consultations hors horaires", "9", "7 %"],
        ["Revues par les associés", "45", "35 %"],
      ],
      note: "Aucune consultation anormale non justifiée. Les 9 accès hors horaires sont rattachés à des échéances contentieuses.",
    },
    Téléchargements: {
      value: "34",
      trend: "−6 % vs. semaine précédente",
      filter: "Documents",
      rows: [
        ["Portail client", "18", "53 %"],
        ["Équipe du cabinet", "14", "41 %"],
        ["Exports administratifs", "2", "6 %"],
      ],
      note: "Tous les téléchargements disposent d’un utilisateur identifié, d’une version documentaire et d’une corrélation.",
    },
    "Actions refusées": {
      value: "3",
      trend: "Stable sur 30 jours",
      filter: "Accès",
      rows: [
        ["Accès dossier restreint", "2", "Bloqué"],
        ["Téléchargement non autorisé", "1", "Bloqué"],
        ["Escalade de privilège", "0", "Aucune"],
      ],
      note: "Les trois tentatives ont été bloquées avant consultation du contenu. Une revue mensuelle reste recommandée.",
    },
    "Accès d’urgence": {
      value: "0",
      trend: "Aucun sur 90 jours",
      filter: "Accès",
      rows: [
        ["Demandes initiées", "0", "—"],
        ["Approbations associées", "0", "—"],
        ["Revues post-accès", "0", "Conforme"],
      ],
      note: "Le mécanisme d’accès d’urgence est disponible mais n’a pas été utilisé. Toute activation exige une justification et une revue a posteriori.",
    },
  }[stat as "Consultations sensibles" | "Téléchargements" | "Actions refusées" | "Accès d’urgence"];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="intake-modal audit-stat-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>ANALYSE DE CONTRÔLE</span>
            <h2>{stat}</h2>
            <p>Lecture consolidée et éléments de surveillance</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="audit-stat-hero">
          <strong>{data.value}</strong>
          <span>{data.trend}</span>
        </div>
        <div className="audit-stat-list">
          {data.rows.map((row) => (
            <div key={row[0]}>
              <b>{row[0]}</b>
              <span>{row[1]}</span>
              <em>{row[2]}</em>
            </div>
          ))}
        </div>
        <div className="audit-event-reason">
          <b>Conclusion de contrôle</b>
          <p>{data.note}</p>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Fermer</button>
          <button className="primary" onClick={() => onShowEvents(data.filter)}>
            Voir les événements liés
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditEventModal({
  event,
  onClose,
}: {
  event: (typeof auditEvents)[number];
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="intake-modal audit-event-modal"
        onClick={(click) => click.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>PREUVE D’AUDIT • {event.category.toUpperCase()}</span>
            <h2>{event.action}</h2>
            <p>{event.date} • {event.actor}</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="audit-event-summary">
          {[
            ["Objet", event.object],
            ["Résultat", event.result],
            ["Corrélation", event.correlation],
            ["Source", event.source],
          ].map((item) => (
            <div key={item[0]}>
              <span>{item[0]}</span>
              <b>{item[1]}</b>
            </div>
          ))}
        </div>
        <div className="audit-event-reason">
          <b>Justification et contrôle appliqué</b>
          <p>{event.reason}</p>
          <small>
            Empreinte conservée • horodatage serveur • événement non modifiable
          </small>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Fermer</button>
          <button
            className="primary"
            onClick={() =>
              downloadAuditFile(
                `preuve-audit-${event.correlation}.txt`,
                [
                  "INTEGER LEGAL — PREUVE D’AUDIT",
                  `Catégorie : ${event.category}`,
                  `Date : ${event.date}`,
                  `Acteur : ${event.actor}`,
                  `Action : ${event.action}`,
                  `Objet : ${event.object}`,
                  `Résultat : ${event.result}`,
                  `Corrélation : ${event.correlation}`,
                  `Source : ${event.source}`,
                  `Justification : ${event.reason}`,
                  "Intégrité : empreinte conservée, horodatage serveur, événement non modifiable.",
                ].join("\n"),
                "text/plain;charset=utf-8",
              )
            }
          >
            Exporter la preuve
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamManagement({ notify }: { notify: (x: string) => void }) {
  const [period, setPeriod] = useState("4 semaines");
  return (
    <div className="team-management">
      <div className="management-controls">
        <div>
          {["Cette semaine", "4 semaines", "Trimestre"].map((x) => (
            <button
              className={period === x ? "active" : ""}
              key={x}
              onClick={() => setPeriod(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <button
          className="secondary"
          onClick={() => notify("Compétences et disponibilités ouvertes")}
        >
          Compétences & disponibilité
        </button>
        <button
          className="primary"
          onClick={() => notify("Simulation de réaffectation enregistrée")}
        >
          Simuler une affectation
        </button>
      </div>
      <div className="capacity-summary">
        {[
          ["Capacité disponible", "428 h", "92% planifiée", "blue"],
          ["Surcharge détectée", "2 personnes", "Actions proposées", "red"],
          ["Échéances couvertes", "96%", "3 sans suppléant", "amber"],
          ["Utilisation cible", "78%", "Équipe globale", "green"],
        ].map((x, i) => (
          <div className="panel" key={i}>
            <i className={x[3]} />
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
          </div>
        ))}
      </div>
      <div className="panel capacity-panel">
        <div className="panel-title">
          <h2>Plan de charge — {period}</h2>
          <button onClick={() => notify("Plan de charge exporté")}>
            Exporter <span>↗</span>
          </button>
        </div>
        <div className="capacity-head">
          <span>Professionnel</span>
          {["S31", "S32", "S33", "S34"].map((x) => (
            <span key={x}>{x}</span>
          ))}
          <span>Charge</span>
        </div>
        {[
          ["SB", "Sara Benali", "Associée", 82, 91, 76, 68],
          ["NE", "Nadia El Idrissi", "Avocate senior", 68, 74, 83, 79],
          ["YA", "Youssef Amrani", "Avocat", 91, 96, 88, 72],
          ["MA", "Meryem Alaoui", "Collaboratrice", 57, 63, 69, 74],
          ["OA", "Omar Alaoui", "Assistant juridique", 44, 52, 48, 61],
        ].map((x, i) => (
          <div className="capacity-row" key={i}>
            <span>
              <i className={`mini-avatar a${i % 4}`}>{x[0]}</i>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </span>
            {(x.slice(3) as number[]).map((v, j) => (
              <span key={j}>
                <i
                  className={v > 90 ? "over" : v > 75 ? "high" : "normal"}
                  style={{ width: `${v}%` }}
                />
                <b>{v}%</b>
              </span>
            ))}
            <span>
              <i
                className={(x[3] as number) > 85 ? "check red" : "check green"}
              >
                {(x[3] as number) > 85 ? "À équilibrer" : "Équilibrée"}
              </i>
            </span>
          </div>
        ))}
      </div>
      <div className="team-bottom">
        <div className="panel">
          <PanelTitle title="Alertes de capacité" action="Voir tout" />
          {[
            ["Youssef Amrani", "Surcharge S31–S33", "3 échéances critiques"],
            ["Sara Benali", "Pic de charge S32", "Dépendance sur 4 dossiers"],
            [
              "Équipe contentieux",
              "Suppléance incomplète",
              "3 échéances sans couverture",
            ],
          ].map((x, i) => (
            <div className="capacity-alert" key={i}>
              <i className={i === 2 ? "amber" : "red"} />
              <div>
                <b>{x[0]}</b>
                <span>
                  {x[1]} • {x[2]}
                </span>
              </div>
              <button
                onClick={() => notify(`Alerte de capacité ouverte — ${x[0]}`)}
              >
                Traiter
              </button>
            </div>
          ))}
        </div>
        <div className="panel">
          <PanelTitle title="Compétences mobilisées" action="Référentiel" />
          <div className="skill-cloud">
            {[
              ["Contentieux commercial", 92],
              ["Corporate", 74],
              ["M&A", 68],
              ["Recouvrement", 81],
              ["Arabe juridique", 86],
              ["Anglais juridique", 72],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <div>
                  <i style={{ width: x[1] + "%" }} />
                </div>
                <b>{x[1]}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  const [axis, setAxis] = useState("Direction");
  const reportData = {
    Direction: {
      kpis: [
        ["Dossiers actifs", "28", "+4 ce mois"],
        ["Production HT", "486 200 DH", "+12,4%"],
        ["Marge estimée", "41,8%", "+2,1 pts"],
        ["Échéances sûres", "96%", "3 à traiter"],
        ["Satisfaction client", "4,6 / 5", "18 réponses"],
      ],
      chartTitle: "Activité et production",
      chartAction: "12 mois",
      chartValues: [44, 51, 48, 62, 58, 70, 67, 76, 72, 85, 81, 91],
      focusTitle: "Portefeuille par risque",
      focusAction: "28 dossiers",
      focusValue: "28",
      focusLabel: "dossiers",
    },
    Activité: {
      kpis: [
        ["Nouveaux dossiers", "12", "+3 ce mois"],
        ["Audiences tenues", "18", "94% préparées"],
        ["Actes produits", "146", "+16,8%"],
        ["Temps saisi", "1 284 h", "91% validé"],
        ["Délai moyen", "3,2 j", "−0,6 jour"],
      ],
      chartTitle: "Volume d’activité juridique",
      chartAction: "12 mois",
      chartValues: [38, 46, 42, 55, 63, 58, 72, 69, 78, 82, 88, 94],
      focusTitle: "Répartition des dossiers",
      focusAction: "28 actifs",
      focusValue: "146",
      focusLabel: "actes produits",
    },
    Finance: {
      kpis: [
        ["Chiffre d’affaires", "486 200 DH", "+12,4%"],
        ["Encaissé", "392 800 DH", "80,8% du CA"],
        ["À facturer", "74 600 DH", "18 dossiers"],
        ["Impayés", "36 400 DH", "4 à relancer"],
        ["Marge nette", "41,8%", "+2,1 pts"],
      ],
      chartTitle: "Facturation et encaissements",
      chartAction: "12 mois",
      chartValues: [35, 42, 39, 50, 48, 61, 57, 66, 73, 78, 84, 89],
      focusTitle: "Taux d’encaissement",
      focusAction: "Objectif 85%",
      focusValue: "80,8%",
      focusLabel: "encaissé",
    },
    Risque: {
      kpis: [
        ["Risques élevés", "5", "2 critiques"],
        ["Conflits ouverts", "3", "1 à arbitrer"],
        ["Échéances exposées", "3", "Action requise"],
        ["Dossiers sensibles", "8", "−2 ce mois"],
        ["Couverture", "89%", "+4 pts"],
      ],
      chartTitle: "Évolution de l’exposition au risque",
      chartAction: "12 mois",
      chartValues: [76, 72, 69, 71, 64, 62, 58, 55, 51, 47, 43, 39],
      focusTitle: "Portefeuille par niveau de risque",
      focusAction: "28 dossiers",
      focusValue: "5",
      focusLabel: "risques élevés",
    },
    Qualité: {
      kpis: [
        ["Dossiers complets", "89%", "+5 pts"],
        ["Échéances acquittées", "96%", "3 à traiter"],
        ["Documents classés", "82%", "+7 pts"],
        ["Validation sous 48 h", "74%", "+9 pts"],
        ["Satisfaction client", "4,6 / 5", "18 réponses"],
      ],
      chartTitle: "Progression des standards qualité",
      chartAction: "12 mois",
      chartValues: [52, 57, 61, 60, 66, 70, 74, 73, 79, 83, 87, 91],
      focusTitle: "Conformité opérationnelle",
      focusAction: "Objectif 95%",
      focusValue: "89%",
      focusLabel: "dossiers complets",
    },
  }[axis as "Direction" | "Activité" | "Finance" | "Risque" | "Qualité"];
  return (
    <div className="reports-view">
      <div className="report-tabs">
        {["Direction", "Activité", "Finance", "Risque", "Qualité"].map((x) => (
          <button
            className={axis === x ? "active" : ""}
            onClick={() => setAxis(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="report-kpis">
        {reportData.kpis.map((x, i) => (
          <div className="panel" key={i}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small className={i === 3 ? "warn" : ""}>{x[2]}</small>
          </div>
        ))}
      </div>
      <div className="reports-grid">
        <div className="panel report-chart">
          <PanelTitle
            title={reportData.chartTitle}
            action={reportData.chartAction}
          />
          <div className="big-chart">
            {reportData.chartValues.map((v, i) => (
              <div key={i}>
                <i style={{ height: v + "%" }}>
                  <b style={{ height: Math.max(v - 22, 15) + "%" }} />
                </i>
                <span>
                  {
                    [
                      "Aoû",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Déc",
                      "Jan",
                      "Fév",
                      "Mar",
                      "Avr",
                      "Mai",
                      "Juin",
                      "Juil",
                    ][i]
                  }
                </span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i className="light" /> Production
            </span>
            <span>
              <i /> Encaissé
            </span>
          </div>
        </div>
        <div className="panel portfolio-risk">
          <PanelTitle
            title={reportData.focusTitle}
            action={reportData.focusAction}
          />
          <div className="donut">
            <div>
              <strong>{reportData.focusValue}</strong>
              <span>{reportData.focusLabel}</span>
            </div>
          </div>
          <div className="risk-legend">
            <span>
              <i className="green" />
              Faible <b>12</b>
            </span>
            <span>
              <i className="amber" />
              Moyen <b>11</b>
            </span>
            <span>
              <i className="red" />
              Élevé <b>5</b>
            </span>
          </div>
        </div>
        <div className="panel profitability">
          <PanelTitle title="Rentabilité par dossier" action="Voir l’analyse" />
          <div className="profit-head">
            <span>Dossier</span>
            <span>Production</span>
            <span>Marge</span>
            <span>Tendance</span>
          </div>
          {[
            ["Projet Horizon", "168 400 DH", "52%", "↗"],
            ["Atlas c/ Distribution", "148 600 DH", "38%", "→"],
            ["Groupe Andalous", "112 900 DH", "44%", "↗"],
            ["Créances Logis Nord", "56 300 DH", "24%", "↘"],
          ].map((x, i) => (
            <div className="profit-row" key={i}>
              <b>{x[0]}</b>
              <span>{x[1]}</span>
              <i className={i === 3 ? "low" : ""}>{x[2]}</i>
              <em className={i === 3 ? "down" : ""}>{x[3]}</em>
            </div>
          ))}
        </div>
        <div className="panel quality-panel">
          <PanelTitle title="Qualité opérationnelle" action="Plan d’action" />
          {[
            ["Dossiers complets", "89%", 89, "green"],
            ["Échéances acquittées", "96%", 96, "green"],
            ["Documents classés", "82%", 82, "amber"],
            ["Temps validé sous 48 h", "74%", 74, "amber"],
            ["Portail client actualisé", "68%", 68, "red"],
          ].map((x) => (
            <div className="quality-row" key={x[0]}>
              <span>{x[0]}</span>
              <div>
                <i className={String(x[3])} style={{ width: x[2] + "%" }} />
              </div>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="panel action-plan">
        <PanelTitle
          title="Plan d’action de direction"
          action="Nouvelle action"
        />
        <div className="plan-row header">
          <span>Priorité</span>
          <span>Action</span>
          <span>Propriétaire</span>
          <span>Échéance</span>
          <span>Statut</span>
        </div>
        {[
          [
            "P0",
            "Sécuriser les 3 échéances sans suppléant",
            "Sara Benali",
            "Aujourd’hui",
            "En cours",
          ],
          [
            "P1",
            "Régulariser les documents non classés",
            "Nadia El Idrissi",
            "05 août",
            "Planifiée",
          ],
          [
            "P1",
            "Rééquilibrer la charge contentieux",
            "Sara Benali",
            "02 août",
            "À décider",
          ],
        ].map((x, i) => (
          <div className="plan-row" key={i}>
            <i className={i === 0 ? "p0" : "p1"}>{x[0]}</i>
            <b>{x[1]}</b>
            <span>{x[2]}</span>
            <span>{x[3]}</span>
            <em>{x[4]}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function GovernanceSettings({ notify }: { notify: (x: string) => void }) {
  const [section, setSection] = useState("Rôles & accès");
  return (
    <div className="governance-settings">
      <aside className="settings-menu">
        {[
          "Rôles & accès",
          "Barrières d’information",
          "Règles d’échéances",
          "Politiques documentaires",
          "Trilinguisme",
          "Intégrations",
        ].map((x) => (
          <button
            className={section === x ? "active" : ""}
            key={x}
            onClick={() => setSection(x)}
          >
            {x}
            <span>›</span>
          </button>
        ))}
      </aside>
      <section>
        {section === "Rôles & accès" ? (
          <>
            <div className="panel role-matrix">
              <PanelTitle
                title="Rôles et habilitations"
                action="Créer un rôle"
              />
              <div className="role-head">
                <span>Capacité</span>
                {[
                  "Associé",
                  "Avocat",
                  "Assistant",
                  "Finance",
                  "Admin tech.",
                ].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              {[
                ["Voir tous les dossiers", "✓", "—", "—", "—", "—"],
                ["Voir les dossiers affectés", "✓", "✓", "✓", "—", "—"],
                ["Valider une échéance", "✓", "✓", "—", "—", "—"],
                ["Approuver une préfacture", "✓", "—", "—", "✓", "—"],
                ["Administrer la plateforme", "—", "—", "—", "—", "✓"],
                ["Accéder au contenu juridique", "✓", "✓", "Limité", "—", "—"],
              ].map((x, i) => (
                <div className="role-row" key={i}>
                  {x.map((y, j) => (
                    <span
                      className={y === "✓" ? "yes" : y === "—" ? "no" : ""}
                      key={j}
                    >
                      {y}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="security-principle">
              Principe : une autorisation générale ne contourne jamais une
              restriction nominative, une barrière d’information ou la
              classification d’un dossier.
            </div>
          </>
        ) : (
          <div className="panel settings-placeholder">
            <i>⚙</i>
            <h2>{section}</h2>
            <p>
              Configuration versionnée, soumise à habilitation et enregistrée
              dans l’audit.
            </p>
            <div>
              {[
                ["Statut", "Politique active"],
                ["Dernière révision", "31 juillet 2026"],
                ["Propriétaire", "Comité métier & sécurité"],
                ["Prochaine revue", "30 septembre 2026"],
              ].map((x) => (
                <span key={x[0]}>
                  <small>{x[0]}</small>
                  <b>{x[1]}</b>
                </span>
              ))}
            </div>
            <button
              className="primary"
              onClick={() =>
                notify(`${section} — modification soumise à validation`)
              }
            >
              Préparer une modification
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function GlobalSearch({
  query,
  onClose,
  onOpen,
}: {
  query: string;
  onClose: () => void;
  onOpen: (m: (typeof matters)[number]) => void;
}) {
  const matterMatches = matters.filter((m) =>
    `${m.name} ${m.client} ${m.ref}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="global-search">
      <div className="search-head">
        <span>Résultats pour « {query} »</span>
        <button onClick={onClose}>×</button>
      </div>
      {matterMatches.length > 0 && (
        <section>
          <h3>Dossiers</h3>
          {matterMatches.map((m) => (
            <button key={m.ref} onClick={() => onOpen(m)}>
              <i>▣</i>
              <div>
                <b>{m.name}</b>
                <span>
                  {m.ref} • {m.client}
                </span>
              </div>
              <em className={`badge ${m.risk}`}>{m.risk}</em>
            </button>
          ))}
        </section>
      )}
      <section>
        <h3>Autres résultats</h3>
        {[
          ["♙", "Société Atlas", "Client • Casablanca"],
          ["▤", "Conclusions — version officielle", "Document • IL-2026-0091"],
          ["□", "Audience du 1er août", "Échéance • 09:30"],
        ]
          .filter(
            (x) =>
              x.join(" ").toLowerCase().includes(query.toLowerCase()) ||
              query.length < 3,
          )
          .map((x, i) => (
            <button
              key={i}
              onClick={() => announceAction(`Résultat ouvert — ${x[1]}`)}
            >
              <i>{x[0]}</i>
              <div>
                <b>{x[1]}</b>
                <span>{x[2]}</span>
              </div>
            </button>
          ))}
      </section>
      <footer>
        <span>↵ Ouvrir</span>
        <span>Échap Fermer</span>
        <b>Recherche limitée aux habilitations de Sara Benali</b>
      </footer>
    </div>
  );
}

type NotificationAssignment = {
  id: number;
  title: string;
  category: "urgent" | "approvals" | "task";
  status: "open" | "completed";
  dueAt: number | null;
  createdAt: number;
  updatedAt: number;
  matterRef: string | null;
  assigneeName: string;
};
type NotificationEvent = {
  id: number;
  details: string;
  createdAt: number;
  title: string;
};
type NotificationPreferences = {
  reminderHours: number;
  urgentEnabled: boolean;
  approvalsEnabled: boolean;
  tasksEnabled: boolean;
};
const defaultNotificationPreferences: NotificationPreferences = {
  reminderHours: 24,
  urgentEnabled: true,
  approvalsEnabled: true,
  tasksEnabled: true,
};

function useTaskNotifications() {
  const [data, setData] = useState<{
    assignments: NotificationAssignment[];
    events: NotificationEvent[];
    lastReadAt: number;
    preferences: NotificationPreferences;
  }>({
    assignments: [],
    events: [],
    lastReadAt: 0,
    preferences: defaultNotificationPreferences,
  });
  useEffect(() => {
    const load = () =>
      Promise.all([
        fetch("/api/work", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ])
        .then(async ([work, state]) => {
          if (!work.ok || !state.ok) throw new Error();
          const w = (await work.json()) as {
            assignments: NotificationAssignment[];
            events: NotificationEvent[];
          };
          const s = (await state.json()) as {
            lastReadAt: number;
            preferences: NotificationPreferences;
          };
          setData({
            ...w,
            lastReadAt: s.lastReadAt,
            preferences: s.preferences || defaultNotificationPreferences,
          });
        })
        .catch(() =>
          setData({
            assignments: [],
            events: [],
            lastReadAt: 0,
            preferences: defaultNotificationPreferences,
          }),
        );
    void load();
    window.addEventListener("integer-notifications-read", load);
    return () => window.removeEventListener("integer-notifications-read", load);
  }, []);
  return data;
}

function TaskNotificationButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  const { assignments, lastReadAt, preferences } = useTaskNotifications();
  const [now] = useState(() => Date.now() / 1000);
  const count = assignments.filter(
    (item) =>
      item.updatedAt > lastReadAt &&
      item.status === "open" &&
      ((item.category === "approvals" && preferences.approvalsEnabled) ||
        (item.category === "urgent" &&
          preferences.urgentEnabled &&
          Boolean(
            item.dueAt && item.dueAt <= now + preferences.reminderHours * 3600,
          )) ||
        (item.category === "task" &&
          preferences.tasksEnabled &&
          Boolean(
            item.dueAt && item.dueAt <= now + preferences.reminderHours * 3600,
          ))),
  ).length;
  return (
    <button
      aria-label="Notifications"
      aria-expanded={open}
      className="icon-button"
      onClick={onClick}
    >
      ◔{count > 0 && <em>{Math.min(count, 9)}</em>}
    </button>
  );
}

function NotificationCenter({
  lang,
  onClose,
  notify,
  onNavigate,
}: {
  lang: Lang;
  onClose: () => void;
  notify: (x: string) => void;
  onNavigate: (view: View) => void;
}) {
  const [tab, setTab] = useState<"priority" | "all">("priority");
  const { assignments, events, preferences } = useTaskNotifications();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draftPreferences, setDraftPreferences] =
    useState<NotificationPreferences>(preferences);
  const [now] = useState(() => Date.now() / 1000);
  const work = assignments
    .filter((item) => item.status === "open")
    .filter((item) =>
      item.category === "urgent"
        ? preferences.urgentEnabled
        : item.category === "approvals"
          ? preferences.approvalsEnabled
          : preferences.tasksEnabled,
    )
    .filter(
      (item) =>
        tab === "all" ||
        item.category === "approvals" ||
        Boolean(
          item.dueAt && item.dueAt <= now + preferences.reminderHours * 3600,
        ),
    );
  const generated = events
    .filter((event) => event.details.includes("Génération automatique"))
    .slice(0, 2);
  const actionCount = work.filter(
    (item) =>
      item.category === "approvals" || Boolean(item.dueAt && item.dueAt <= now),
  ).length;
  const labels =
    lang === "en"
      ? {
          title: "Notification center",
          actions: "actions required",
          priority: "Priority",
          all: "All",
          overdue: "Overdue task",
          today: "Upcoming deadline",
          approval: "Approval required",
          generated: "Recurring task generated",
          open: "Open",
          read: "Mark all as read",
          empty: "No notification",
          preferences: "Preferences",
          preferenceTitle: "Notification preferences",
          reminder: "Alert before deadline",
          urgentToggle: "Urgent items",
          approvalToggle: "Approvals",
          taskToggle: "Standard tasks",
          save: "Save preferences",
          saved: "Preferences saved",
        }
      : lang === "ar"
        ? {
            title: "مركز الإشعارات",
            actions: "إجراءات مطلوبة",
            priority: "الأولوية",
            all: "الكل",
            overdue: "مهمة متأخرة",
            today: "موعد قريب",
            approval: "موافقة مطلوبة",
            generated: "تم إنشاء مهمة متكررة",
            open: "فتح",
            read: "تعليم الكل كمقروء",
            empty: "لا توجد إشعارات",
            preferences: "التفضيلات",
            preferenceTitle: "تفضيلات الإشعارات",
            reminder: "التنبيه قبل الأجل",
            urgentToggle: "المهام المستعجلة",
            approvalToggle: "المصادقات",
            taskToggle: "المهام العادية",
            save: "حفظ التفضيلات",
            saved: "تم حفظ التفضيلات",
          }
        : {
            title: "Centre de notifications",
            actions: "actions requises",
            priority: "Prioritaires",
            all: "Toutes",
            overdue: "Tâche en retard",
            today: "Échéance proche",
            approval: "Validation requise",
            generated: "Tâche récurrente générée",
            open: "Ouvrir",
            read: "Tout marquer comme lu",
            empty: "Aucune notification",
            preferences: "Préférences",
            preferenceTitle: "Préférences de notifications",
            reminder: "Alerter avant l’échéance",
            urgentToggle: "Éléments urgents",
            approvalToggle: "Validations",
            taskToggle: "Tâches normales",
            save: "Enregistrer les préférences",
            saved: "Préférences enregistrées",
          };
  return (
    <div className="notification-center">
      <div className="notification-head">
        <div>
          <h2>{labels.title}</h2>
          <span>
            {actionCount} {labels.actions}
          </span>
        </div>
        <button onClick={onClose}>×</button>
      </div>
      <div className="notification-tabs">
        <button
          className={tab === "priority" ? "active" : ""}
          onClick={() => setTab("priority")}
        >
          {labels.priority}
        </button>
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          {labels.all}
        </button>
      </div>
      {work.map((item) => {
        const overdue = Boolean(item.dueAt && item.dueAt < now);
        const kind =
          item.category === "approvals"
            ? labels.approval
            : overdue
              ? labels.overdue
              : labels.today;
        return (
          <div className="notification-item" key={`w-${item.id}`}>
            <i
              className={
                overdue
                  ? "red"
                  : item.category === "approvals"
                    ? "amber"
                    : "blue"
              }
            />
            <div>
              <b>{kind}</b>
              <strong>{item.title}</strong>
              <span>
                {item.matterRef && `${item.matterRef} • `}
                {item.assigneeName}
                {item.dueAt &&
                  ` • ${new Date(item.dueAt * 1000).toLocaleString()}`}
              </span>
            </div>
            <button onClick={() => onNavigate("tasks")}>{labels.open}</button>
          </div>
        );
      })}
      {tab === "all" &&
        generated.map((event) => (
          <div className="notification-item" key={`e-${event.id}`}>
            <i className="green" />
            <div>
              <b>{labels.generated}</b>
              <strong>{event.title}</strong>
              <span>{new Date(event.createdAt * 1000).toLocaleString()}</span>
            </div>
            <button onClick={() => onNavigate("tasks")}>{labels.open}</button>
          </div>
        ))}
      {work.length === 0 && (tab === "priority" || generated.length === 0) && (
        <div className="notification-empty">✓ {labels.empty}</div>
      )}
      <div className="notification-footer">
        <button onClick={() => notify(labels.read)}>{labels.read}</button>
        <button
          onClick={() => {
            setDraftPreferences(preferences);
            setPreferencesOpen(true);
          }}
        >
          {labels.preferences}
        </button>
      </div>
      {preferencesOpen && (
        <div className="notification-preferences">
          <div className="notification-preference-head">
            <h3>{labels.preferenceTitle}</h3>
            <button onClick={() => setPreferencesOpen(false)}>×</button>
          </div>
          <label>
            {labels.reminder}
            <select
              value={draftPreferences.reminderHours}
              onChange={(event) =>
                setDraftPreferences((current) => ({
                  ...current,
                  reminderHours: Number(event.target.value),
                }))
              }
            >
              {[4, 12, 24, 48, 72].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} h
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ["urgentEnabled", labels.urgentToggle],
              ["approvalsEnabled", labels.approvalToggle],
              ["tasksEnabled", labels.taskToggle],
            ] as const
          ).map(([key, label]) => (
            <label className="preference-toggle" key={key}>
              <span>{label}</span>
              <input
                type="checkbox"
                checked={draftPreferences[key]}
                onChange={(event) =>
                  setDraftPreferences((current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
              />
            </label>
          ))}
          <button
            className="primary"
            onClick={async () => {
              const response = await fetch("/api/notifications", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ preferences: draftPreferences }),
              });
              if (response.ok) {
                window.dispatchEvent(new Event("integer-notifications-read"));
                notify(labels.saved);
                setPreferencesOpen(false);
              }
            }}
          >
            {labels.save}
          </button>
        </div>
      )}
    </div>
  );
}

function QuickActions({
  onClose,
  onIntake,
  onDocument,
  notify,
}: {
  onClose: () => void;
  onIntake: () => void;
  onDocument: () => void;
  notify: (x: string) => void;
}) {
  return (
    <div className="modal-backdrop quick-backdrop" onClick={onClose}>
      <div className="quick-actions" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2>Créer rapidement</h2>
          <button onClick={onClose}>×</button>
        </div>
        {[
          [
            "＋",
            "Nouvelle sollicitation",
            "Démarrer l’acceptation et le contrôle",
            onIntake,
          ],
          [
            "▣",
            "Nouveau dossier",
            "Après acceptation validée",
            () => notify("Ouverture directe interdite — acceptation requise"),
          ],
          [
            "□",
            "Nouvelle échéance",
            "Avec source, règle et validation",
            () => notify("Choisissez d’abord un dossier"),
          ],
          [
            "▤",
            "Ajouter un document",
            "Classer, versionner et qualifier",
            onDocument,
          ],
          [
            "◷",
            "Saisir du temps",
            "Rattacher une activité au dossier",
            () => notify("Formulaire de temps ouvert"),
          ],
          [
            "◇",
            "Contrôle de conflits",
            "Rechercher les parties et relations",
            () => notify("Contrôle de conflits ouvert"),
          ],
        ].map((x, i) => (
          <button key={i} onClick={x[3] as () => void}>
            <i>{x[0] as string}</i>
            <div>
              <b>{x[1] as string}</b>
              <span>{x[2] as string}</span>
            </div>
            <em>›</em>
          </button>
        ))}
      </div>
    </div>
  );
}

function GuidedTour({
  step,
  onStep,
  onNavigate,
}: {
  step: number;
  onStep: (n: number) => void;
  onNavigate: (v: View) => void;
}) {
  const slides = [
    {
      title: "Bienvenue dans Integer Legal",
      text: "Découvrez en quelques étapes comment sécuriser les dossiers et piloter le cabinet.",
      view: "dashboard" as View,
      icon: "IL",
    },
    {
      title: "Maîtriser les dossiers",
      text: "Le Dossier 360° réunit parties, procédures, échéances, documents, temps, finances et risques.",
      view: "matters" as View,
      icon: "▣",
    },
    {
      title: "Sécuriser les délais",
      text: "Chaque échéance critique conserve sa source, sa règle, son responsable, son suppléant et sa validation.",
      view: "calendar" as View,
      icon: "□",
    },
    {
      title: "Collaborer avec le client",
      text: "Le portail ne montre que les contenus explicitement publiés et trace chaque action.",
      view: "portal" as View,
      icon: "◎",
    },
    {
      title: "Piloter avec des données fiables",
      text: "Rapports, rentabilité, capacité, risques, qualité et plans d’action soutiennent la direction.",
      view: "reports" as View,
      icon: "▥",
    },
  ];
  const s = slides[step - 1];
  const go = (n: number) => {
    if (n > slides.length) {
      onStep(0);
      onNavigate("dashboard");
    } else {
      onStep(n);
      onNavigate(slides[n - 1].view);
    }
  };
  return (
    <div className="tour-overlay">
      <div className="tour-card">
        <button className="tour-close" onClick={() => onStep(0)}>
          ×
        </button>
        <span className="tour-icon">{s.icon}</span>
        <small>
          ÉTAPE {step} SUR {slides.length}
        </small>
        <h2>{s.title}</h2>
        <p>{s.text}</p>
        <div className="tour-dots">
          {slides.map((_, i) => (
            <i className={i + 1 === step ? "active" : ""} key={i} />
          ))}
        </div>
        <footer>
          <button
            className="secondary"
            disabled={step === 1}
            onClick={() => go(step - 1)}
          >
            Précédent
          </button>
          <button className="primary" onClick={() => go(step + 1)}>
            {step === slides.length ? "Terminer" : "Suivant"}
          </button>
        </footer>
      </div>
    </div>
  );
}
