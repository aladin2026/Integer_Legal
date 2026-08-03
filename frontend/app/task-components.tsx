"use client";

import { useEffect, useState } from "react";

type Notify = (message: string) => void;
type Priority = "high" | "normal" | "low";
type Member = { id: number; fullName: string; initials: string };
type Viewer = { id: number; fullName: string; role: string };
type Assignment = {
  id: number;
  externalRef: string;
  title: string;
  description: string;
  category: "urgent" | "approvals" | "task";
  targetView: string;
  matterRef: string | null;
  priority: Priority;
  status: "open" | "completed";
  dueAt: number | null;
  assigneeId: number;
  assigneeName: string;
  assigneeInitials: string;
};
type Lang = "fr" | "en" | "ar";
type RecurringTemplate = {
  id: number;
  title: string;
  description: string;
  frequency: "weekly" | "monthly" | "quarterly";
  intervalDays: number;
  nextRunAt: number;
  priority: Priority;
  status: "active" | "paused";
  lastGeneratedAt: number | null;
  assigneeId: number;
  assigneeName: string;
  assigneeInitials: string;
};

const fallbackMembers: Member[] = [
  { id: 1, fullName: "Sara Benali", initials: "SB" },
  { id: 2, fullName: "Nadia El Idrissi", initials: "NE" },
  { id: 3, fullName: "Youssef Amrani", initials: "YA" },
  { id: 4, fullName: "Meryem Alaoui", initials: "MA" },
];
const copy = {
  fr: {
    tabs: ["Tableau", "Mes tâches", "Validations", "Récurrentes"],
    open: "Tâches ouvertes",
    today: "À faire aujourd’hui",
    late: "En retard",
    validate: "À valider",
    rate: "Taux de réalisation",
    plan: "Plan de travail du cabinet",
    hint: "Une seule source partagée pour la file du jour et le suivi des tâches.",
    newTask: "Nouvelle tâche",
    mine: "Mes tâches",
    mineHint: "Tâches qui vous sont personnellement affectées.",
    pending: "Validations en attente",
    empty: "Aucune action dans cette catégorie",
    done: "Terminer",
    approve: "Valider",
    corrections: "Demander des corrections",
    synced: "Synchronisé",
    demo: "Mode démonstration",
    alerts: "Alertes d’échéance",
    alertsHint: "Actions à traiter en priorité aujourd’hui",
    review: "Examiner",
  },
  en: {
    tabs: ["Board", "My tasks", "Approvals", "Recurring"],
    open: "Open tasks",
    today: "Due today",
    late: "Overdue",
    validate: "To approve",
    rate: "Completion rate",
    plan: "Firm work plan",
    hint: "One shared source for today’s queue and task tracking.",
    newTask: "New task",
    mine: "My tasks",
    mineHint: "Tasks personally assigned to you.",
    pending: "Pending approvals",
    empty: "No action in this category",
    done: "Complete",
    approve: "Approve",
    corrections: "Request changes",
    synced: "Synced",
    demo: "Demo mode",
    alerts: "Deadline alerts",
    alertsHint: "Actions requiring priority attention today",
    review: "Review",
  },
  ar: {
    tabs: ["اللوحة", "مهامي", "الموافقات", "المتكررة"],
    open: "المهام المفتوحة",
    today: "مستحقة اليوم",
    late: "متأخرة",
    validate: "بانتظار الموافقة",
    rate: "نسبة الإنجاز",
    plan: "خطة عمل المكتب",
    hint: "مصدر مشترك واحد لقائمة اليوم ومتابعة المهام.",
    newTask: "مهمة جديدة",
    mine: "مهامي",
    mineHint: "المهام المسندة إليك شخصياً.",
    pending: "الموافقات المعلقة",
    empty: "لا توجد إجراءات في هذه الفئة",
    done: "إنهاء",
    approve: "موافقة",
    corrections: "طلب تعديلات",
    synced: "متزامن",
    demo: "وضع تجريبي",
    alerts: "تنبيهات الآجال",
    alertsHint: "الإجراءات ذات الأولوية اليوم",
    review: "مراجعة",
  },
} as const;

export function TaskManagement({
  notify,
  lang = "fr",
  openRequest = 0,
}: {
  notify: Notify;
  lang?: Lang;
  openRequest?: number;
}) {
  const t = copy[lang];
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState(openRequest > 0);
  const [items, setItems] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>(fallbackMembers);
  const [viewer, setViewer] = useState<Viewer>({
    id: 1,
    fullName: "Sara Benali",
    role: "partner",
  });
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [now] = useState(() => Date.now() / 1000);
  const [generatedNotice, setGeneratedNotice] = useState(0);
  const load = async () => {
    try {
      const response = await fetch("/api/work", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        viewer: Viewer;
        assignments: Assignment[];
        members: Member[];
      };
      setViewer(data.viewer);
      setItems(data.assignments);
      setMembers(data.members);
      setShared(true);
    } catch {
      setShared(false);
    }
  };
  useEffect(() => {
    fetch("/api/work", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{
          viewer: Viewer;
          assignments: Assignment[];
          members: Member[];
          generatedRecurring: number;
        }>;
      })
      .then((data) => {
        setViewer(data.viewer);
        setItems(data.assignments);
        setMembers(data.members);
        setShared(true);
        setGeneratedNotice(data.generatedRecurring || 0);
      })
      .catch(() => setShared(false));
  }, [lang]);
  const open = items.filter((item) => item.status === "open");
  const completed = items.filter((item) => item.status === "completed");
  const mine = open.filter((item) => item.assigneeId === viewer.id);
  const approvals = open.filter((item) => item.category === "approvals");
  const todayEnd = new Date(now * 1000);
  todayEnd.setHours(23, 59, 59, 999);
  const dueToday = open.filter(
    (item) =>
      item.dueAt &&
      item.dueAt <= todayEnd.getTime() / 1000 &&
      item.dueAt >= now,
  ).length;
  const late = open.filter((item) => item.dueAt && item.dueAt < now).length;
  const completion = Math.round(
    (completed.length / Math.max(items.length, 1)) * 100,
  );
  const columns = [
    {
      title: lang === "en" ? "To do" : lang === "ar" ? "للإنجاز" : "À faire",
      tasks: open.filter(
        (x) => x.category !== "approvals" && x.priority === "high",
      ),
    },
    {
      title:
        lang === "en"
          ? "In progress"
          : lang === "ar"
            ? "قيد التنفيذ"
            : "En cours",
      tasks: open.filter(
        (x) => x.category !== "approvals" && x.priority !== "high",
      ),
    },
    {
      title:
        lang === "en"
          ? "In approval"
          : lang === "ar"
            ? "قيد الموافقة"
            : "En validation",
      tasks: approvals,
    },
    {
      title: lang === "en" ? "Completed" : lang === "ar" ? "مكتملة" : "Terminé",
      tasks: completed,
    },
  ];
  const patch = async (id: number, status: "completed") => {
    setBusy(id);
    try {
      if (shared) {
        const response = await fetch("/api/work", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ assignmentId: id, status }),
        });
        if (!response.ok) throw new Error();
      }
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      notify(
        lang === "en"
          ? "Task completed and queue updated"
          : lang === "ar"
            ? "تم إنهاء المهمة وتحديث القائمة"
            : "Tâche terminée et file mise à jour",
      );
    } catch {
      notify("Action non enregistrée");
    } finally {
      setBusy(null);
    }
  };
  const formatDue = (value: number | null) =>
    value
      ? new Date(value * 1000).toLocaleString(
          lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-FR",
          {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "—";
  const priority = (value: Priority) =>
    value === "high"
      ? lang === "en"
        ? "High"
        : lang === "ar"
          ? "عاجلة"
          : "Urgente"
      : value === "low"
        ? lang === "en"
          ? "Low"
          : lang === "ar"
            ? "منخفضة"
            : "Basse"
        : lang === "en"
          ? "Normal"
          : lang === "ar"
            ? "عادية"
            : "Normale";
  return (
    <div className="task-management">
      {generatedNotice > 0 && (
        <div className="generated-notice">
          <span>✓</span>
          <b>
            {lang === "en"
              ? `${generatedNotice} recurring task(s) automatically generated`
              : lang === "ar"
                ? `تم إنشاء ${generatedNotice} مهمة متكررة تلقائياً`
                : `${generatedNotice} tâche(s) récurrente(s) générée(s) automatiquement`}
          </b>
          <button onClick={() => setGeneratedNotice(0)}>×</button>
        </div>
      )}
      {(late > 0 || dueToday > 0) && (
        <section className="panel deadline-alerts">
          <div className="deadline-alert-head">
            <span>!</span>
            <div>
              <h2>{t.alerts}</h2>
              <p>{t.alertsHint}</p>
            </div>
            <button className="secondary" onClick={() => setTab(1)}>
              {t.review} ›
            </button>
          </div>
          <div className="deadline-alert-list">
            {open
              .filter(
                (item) => item.dueAt && item.dueAt <= todayEnd.getTime() / 1000,
              )
              .slice(0, 3)
              .map((item) => (
                <article key={item.id}>
                  <i
                    className={
                      item.dueAt && item.dueAt < now ? "overdue" : "today"
                    }
                  >
                    {item.dueAt && item.dueAt < now ? t.late : t.today}
                  </i>
                  <div>
                    <b>{item.title}</b>
                    <small>
                      {item.matterRef || item.externalRef} • {item.assigneeName}
                    </small>
                  </div>
                  <time>{formatDue(item.dueAt)}</time>
                  <button
                    disabled={busy === item.id}
                    onClick={() => void patch(item.id, "completed")}
                  >
                    ✓ {t.done}
                  </button>
                </article>
              ))}
          </div>
        </section>
      )}
      <div className="task-tabs">
        {t.tabs.map((label, index) => (
          <button
            key={label}
            className={tab === index ? "active" : ""}
            onClick={() => setTab(index)}
          >
            {label}
            {index === 2 && <em>{approvals.length}</em>}
          </button>
        ))}
      </div>
      <div className="task-kpis">
        {[
          [
            t.open,
            String(open.length),
            `${mine.length} ${t.mine.toLowerCase()}`,
          ],
          [
            t.today,
            String(dueToday),
            late ? `${late} ${t.late.toLowerCase()}` : t.synced,
          ],
          [t.late, String(late), late ? "Action requise" : "✓"],
          [t.validate, String(approvals.length), t.pending],
          [t.rate, `${completion} %`, shared ? t.synced : t.demo],
        ].map((x, i) => (
          <div className="panel" key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <small
              className={i === 2 && late ? "danger" : i === 4 ? "good" : ""}
            >
              {x[2]}
            </small>
          </div>
        ))}
      </div>
      {tab === 0 && (
        <>
          <div className="task-toolbar panel">
            <div>
              <h2>{t.plan}</h2>
              <p>{t.hint}</p>
            </div>
            <div>
              <span
                className={shared ? "sync-badge synced" : "sync-badge local"}
              >
                ● {shared ? t.synced : t.demo}
              </span>
              <button className="primary" onClick={() => setModal(true)}>
                ＋ {t.newTask}
              </button>
            </div>
          </div>
          <div className="kanban">
            {columns.map((column, ci) => (
              <section className="task-column" key={column.title}>
                <header>
                  <span className={`task-dot d${ci}`} />
                  <b>{column.title}</b>
                  <em>{column.tasks.length}</em>
                </header>
                {column.tasks.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    ci={ci}
                    formatDue={formatDue}
                    priority={priority}
                    done={t.done}
                    busy={busy === item.id}
                    onDone={() => void patch(item.id, "completed")}
                  />
                ))}
                {!column.tasks.length && (
                  <div className="queue-empty">{t.empty}</div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
      {tab === 1 && (
        <div className="panel task-list">
          <div className="task-section-head">
            <div>
              <h2>{t.mine}</h2>
              <p>
                {t.mineHint} {viewer.fullName}
              </p>
            </div>
          </div>
          {mine.map((item) => (
            <div className="my-task" key={item.id}>
              <button
                disabled={busy === item.id}
                onClick={() => void patch(item.id, "completed")}
              >
                ○
              </button>
              <span>
                <b>{item.title}</b>
                <small>{item.matterRef || item.externalRef}</small>
              </span>
              <time>{formatDue(item.dueAt)}</time>
              <i>{item.category === "approvals" ? t.validate : t.open}</i>
              <em className={`priority p-${priority(item.priority)}`}>
                {priority(item.priority)}
              </em>
            </div>
          ))}
          {!mine.length && <div className="queue-empty">✓ {t.empty}</div>}
        </div>
      )}
      {tab === 2 && (
        <div className="panel validation-list">
          <div className="task-section-head">
            <div>
              <h2>{t.pending}</h2>
              <p>{t.hint}</p>
            </div>
          </div>
          {approvals.map((item) => (
            <div className="validation-task" key={item.id}>
              <span className="file-icon">✓</span>
              <div>
                <b>{item.title}</b>
                <small>
                  {item.matterRef || item.externalRef} • {item.assigneeName}
                </small>
                <em>{item.description}</em>
              </div>
              <button
                className="secondary"
                onClick={() => notify(t.corrections)}
              >
                {t.corrections}
              </button>
              <button
                className="primary"
                disabled={busy === item.id}
                onClick={() => void patch(item.id, "completed")}
              >
                ✓ {t.approve}
              </button>
            </div>
          ))}
          {!approvals.length && <div className="queue-empty">✓ {t.empty}</div>}
        </div>
      )}
      {tab === 3 && (
        <Recurring
          notify={notify}
          lang={lang}
          members={members}
          reloadTasks={load}
        />
      )}{" "}
      {modal && (
        <TaskModal
          onClose={() => setModal(false)}
          notify={notify}
          members={members}
          shared={shared}
          reload={load}
          lang={lang}
        />
      )}
    </div>
  );
}

function TaskCard({
  item,
  ci,
  formatDue,
  priority,
  done,
  busy,
  onDone,
}: {
  item: Assignment;
  ci: number;
  formatDue: (value: number | null) => string;
  priority: (value: Priority) => string;
  done: string;
  busy: boolean;
  onDone: () => void;
}) {
  return (
    <article className="task-card">
      <div className="task-card-top">
        <i className={`priority p-${priority(item.priority)}`}>
          {priority(item.priority)}
        </i>
        {item.status === "open" && (
          <button disabled={busy} onClick={onDone} title={done}>
            ✓
          </button>
        )}
      </div>
      <h3>{item.title}</h3>
      <p>
        {item.matterRef && `${item.matterRef} • `}
        {item.description}
      </p>
      <div className="task-progress">
        <i
          style={{
            width:
              ci === 3 ? "100%" : ci === 2 ? "85%" : ci === 1 ? "55%" : "20%",
          }}
        />
      </div>
      <div className="task-meta">
        <time className={item.category === "urgent" ? "due" : ""}>
          ◷ {formatDue(item.dueAt)}
        </time>
        <span>{item.assigneeInitials}</span>
      </div>
    </article>
  );
}

function Recurring({
  notify,
  lang,
  members,
  reloadTasks,
}: {
  notify: Notify;
  lang: Lang;
  members: Member[];
  reloadTasks: () => Promise<void>;
}) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const load = () =>
    fetch("/api/recurring", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ templates: RecurringTemplate[] }>;
      })
      .then((data) => setTemplates(data.templates))
      .catch(() => setTemplates([]));
  useEffect(() => {
    fetch("/api/recurring", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ templates: RecurringTemplate[] }>;
      })
      .then((data) => setTemplates(data.templates))
      .catch(() => setTemplates([]));
  }, []);
  const run = async (id: number) => {
    setBusy(id);
    try {
      const r = await fetch("/api/recurring", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "generate", templateId: id }),
      });
      if (!r.ok) throw new Error();
      await Promise.all([load(), reloadTasks()]);
      notify(
        lang === "en"
          ? "Task generated in the shared queue"
          : lang === "ar"
            ? "تم إنشاء المهمة في القائمة المشتركة"
            : "Tâche générée dans la file partagée",
      );
    } catch {
      notify("Génération non enregistrée");
    } finally {
      setBusy(null);
    }
  };
  const toggle = async (template: RecurringTemplate) => {
    const status = template.status === "active" ? "paused" : "active";
    const r = await fetch("/api/recurring", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: template.id, status }),
    });
    if (r.ok) await load();
  };
  const frequency = (value: RecurringTemplate["frequency"]) =>
    value === "weekly"
      ? lang === "en"
        ? "Weekly"
        : lang === "ar"
          ? "أسبوعياً"
          : "Hebdomadaire"
      : value === "monthly"
        ? lang === "en"
          ? "Monthly"
          : lang === "ar"
            ? "شهرياً"
            : "Mensuelle"
        : lang === "en"
          ? "Quarterly"
          : lang === "ar"
            ? "فصلياً"
            : "Trimestrielle";
  return (
    <>
      <div className="task-toolbar panel">
        <div>
          <h2>
            {lang === "en"
              ? "Recurring task templates"
              : lang === "ar"
                ? "نماذج المهام المتكررة"
                : "Modèles de tâches récurrentes"}
          </h2>
          <p>
            {lang === "en"
              ? "Generate a traceable task in the shared queue."
              : lang === "ar"
                ? "إنشاء مهمة قابلة للتتبع في القائمة المشتركة."
                : "Générez une tâche tracée directement dans la file partagée."}
          </p>
        </div>
        <button className="primary" onClick={() => setModal(true)}>
          ＋{" "}
          {lang === "en"
            ? "New template"
            : lang === "ar"
              ? "نموذج جديد"
              : "Nouveau modèle"}
        </button>
      </div>
      <div className="recurring-grid">
        {templates.map((template, i) => (
          <article className="panel recurring-card" key={template.id}>
            <div>
              <i>{i + 1}</i>
              <span>
                {template.status === "active" ? "MODÈLE ACTIF" : "EN PAUSE"}
              </span>
            </div>
            <h3>{template.title}</h3>
            <p>
              {frequency(template.frequency)} •{" "}
              {new Date(template.nextRunAt * 1000).toLocaleDateString(
                lang === "en" ? "en-GB" : lang === "ar" ? "ar-MA" : "fr-FR",
              )}
            </p>
            <small>
              {template.assigneeInitials} · {template.assigneeName}
            </small>
            <footer>
              <button onClick={() => void toggle(template)}>
                {template.status === "active" ? "Pause" : "Activer"}
              </button>
              <button
                disabled={busy === template.id || template.status !== "active"}
                onClick={() => void run(template.id)}
              >
                ＋ Générer maintenant
              </button>
            </footer>
          </article>
        ))}
        {!templates.length && (
          <div className="queue-empty">{copy[lang].empty}</div>
        )}
      </div>
      {modal && (
        <RecurringModal
          lang={lang}
          members={members}
          onClose={() => setModal(false)}
          onSaved={async () => {
            await load();
            setModal(false);
            notify("Modèle récurrent créé");
          }}
        />
      )}
    </>
  );
}

function RecurringModal({
  lang,
  members,
  onClose,
  onSaved,
}: {
  lang: Lang;
  members: Member[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    setSaving(true);
    try {
      const r = await fetch("/api/recurring", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          description: data.get("description"),
          frequency: data.get("frequency"),
          assigneeId: Number(data.get("assigneeId")),
          priority: data.get("priority"),
          nextRunAt: data.get("nextRunAt")
            ? Math.floor(
                new Date(String(data.get("nextRunAt"))).getTime() / 1000,
              )
            : undefined,
        }),
      });
      if (!r.ok) throw new Error();
      await onSaved();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <form
        className="intake-modal task-modal"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(event.currentTarget);
        }}
      >
        <div className="modal-head">
          <div>
            <span>AUTOMATISATION</span>
            <h2>
              {lang === "en"
                ? "New recurring template"
                : lang === "ar"
                  ? "نموذج متكرر جديد"
                  : "Nouveau modèle récurrent"}
            </h2>
            <p>La tâche générée rejoint automatiquement la file partagée.</p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="task-form">
          <label className="wide">
            Intitulé
            <input name="title" required />
          </label>
          <label>
            Fréquence
            <select name="frequency">
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
              <option value="quarterly">Trimestrielle</option>
            </select>
          </label>
          <label>
            Responsable
            <select name="assigneeId">
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priorité
            <select name="priority">
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="low">Basse</option>
            </select>
          </label>
          <label>
            Prochaine génération
            <input name="nextRunAt" type="datetime-local" />
          </label>
          <label className="wide">
            Instructions
            <textarea name="description" />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={saving}>
            {saving ? "…" : "Créer le modèle"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskModal({
  onClose,
  notify,
  members,
  shared,
  reload,
  lang,
}: {
  onClose: () => void;
  notify: Notify;
  members: Member[];
  shared: boolean;
  reload: () => Promise<void>;
  lang: Lang;
}) {
  const [saving, setSaving] = useState(false);
  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    setSaving(true);
    try {
      if (shared) {
        const response = await fetch("/api/work", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: data.get("title"),
            description: data.get("description"),
            category: data.get("category"),
            targetView: "tasks",
            matterRef: data.get("matterRef"),
            assigneeId: Number(data.get("assigneeId")),
            priority: data.get("priority"),
            dueAt: data.get("dueAt")
              ? Math.floor(new Date(String(data.get("dueAt"))).getTime() / 1000)
              : null,
          }),
        });
        if (!response.ok) throw new Error();
        await reload();
      }
      notify(
        lang === "en"
          ? "Task created and shared"
          : lang === "ar"
            ? "تم إنشاء المهمة ومشاركتها"
            : "Tâche créée et partagée",
      );
      onClose();
    } catch {
      notify("Création non enregistrée");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <form
        className="intake-modal task-modal"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(event.currentTarget);
        }}
      >
        <div className="modal-head">
          <div>
            <span>PLAN DE TRAVAIL PARTAGÉ</span>
            <h2>{copy[lang].newTask}</h2>
            <p>{copy[lang].hint}</p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="task-form">
          <label className="wide">
            Intitulé
            <input
              name="title"
              required
              placeholder="Ex. Préparer le projet de conclusions"
            />
          </label>
          <label>
            Dossier
            <input name="matterRef" placeholder="IL-2026-0091" />
          </label>
          <label>
            Responsable
            <select name="assigneeId">
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Catégorie
            <select name="category">
              <option value="task">Tâche</option>
              <option value="urgent">Échéance urgente</option>
              <option value="approvals">Validation</option>
            </select>
          </label>
          <label>
            Priorité
            <select name="priority">
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="low">Basse</option>
            </select>
          </label>
          <label>
            Échéance
            <input name="dueAt" type="datetime-local" />
          </label>
          <label className="wide">
            Instructions
            <textarea
              name="description"
              placeholder="Résultat attendu et points de contrôle…"
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={saving}>
            {saving ? "…" : "Créer et partager"}
          </button>
        </div>
      </form>
    </div>
  );
}
