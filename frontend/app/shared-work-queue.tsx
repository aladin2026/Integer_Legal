"use client";

import { useEffect, useMemo, useState } from "react";
import "./shared-work-queue.css";

type Scope = "mine" | "firm";
type Tab = "all" | "urgent" | "approvals";
type Priority = "high" | "normal" | "low";
type Member = { id: number; fullName: string; initials: string };
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
type Viewer = { id: number; fullName: string; role: string };
type WorkEvent = {
  id: number;
  assignmentId: number;
  action: string;
  details: string;
  createdAt: number;
  actorName: string;
  title: string;
};
type QueueCopy = {
  workQueue: string;
  workQueueHint: string;
  all: string;
  urgent: string;
  approvals: string;
  owner: string;
  risk: string;
  open: string;
  complete: string;
  noWork: string;
  delegated: string;
  resetQueue: string;
};

const fallbackMembers: Member[] = [
  { id: 1, fullName: "Sara Benali", initials: "SB" },
  { id: 2, fullName: "Nadia El Idrissi", initials: "NE" },
  { id: 3, fullName: "Youssef Amrani", initials: "YA" },
  { id: 4, fullName: "Meryem Alaoui", initials: "MA" },
];
const fallbackAssignments: Assignment[] = [
  {
    id: 1,
    externalRef: "WA-001",
    title: "Valider le mémoire en réponse",
    description: "Échéance aujourd’hui à 16:00",
    category: "urgent",
    targetView: "documents",
    matterRef: "IL-2026-0087",
    priority: "high",
    status: "open",
    dueAt: Math.floor(Date.now() / 1000) + 3600,
    assigneeId: 2,
    assigneeName: "Nadia El Idrissi",
    assigneeInitials: "NE",
  },
  {
    id: 2,
    externalRef: "WA-002",
    title: "Approuver 12,5 h de temps",
    description: "Préfacturation • Société Atlas",
    category: "approvals",
    targetView: "time",
    matterRef: "IL-2026-0091",
    priority: "normal",
    status: "open",
    dueAt: Math.floor(Date.now() / 1000) + 7200,
    assigneeId: 1,
    assigneeName: "Sara Benali",
    assigneeInitials: "SB",
  },
  {
    id: 3,
    externalRef: "WA-003",
    title: "Répondre à la demande du client",
    description: "Horizon Capital • Documents complémentaires",
    category: "urgent",
    targetView: "communications",
    matterRef: "IL-2026-0064",
    priority: "high",
    status: "open",
    dueAt: Math.floor(Date.now() / 1000) + 10800,
    assigneeId: 3,
    assigneeName: "Youssef Amrani",
    assigneeInitials: "YA",
  },
  {
    id: 4,
    externalRef: "WA-004",
    title: "Réviser le dépassement budgétaire",
    description: "Projet Horizon • +8 400 DH à autoriser",
    category: "approvals",
    targetView: "budgets",
    matterRef: "IL-2026-0064",
    priority: "normal",
    status: "open",
    dueAt: Math.floor(Date.now() / 1000) + 14400,
    assigneeId: 1,
    assigneeName: "Sara Benali",
    assigneeInitials: "SB",
  },
  {
    id: 5,
    externalRef: "WA-005",
    title: "Préparer l’audience de demain",
    description: "Atlas c/ Maroc Distribution • Salle 4",
    category: "task",
    targetView: "tasks",
    matterRef: "IL-2026-0091",
    priority: "high",
    status: "open",
    dueAt: Math.floor(Date.now() / 1000) + 18000,
    assigneeId: 4,
    assigneeName: "Meryem Alaoui",
    assigneeInitials: "MA",
  },
];

export function SharedWorkQueue({
  lang,
  t,
  notify,
  onNavigate,
  scope,
}: {
  lang: "fr" | "en" | "ar";
  t: QueueCopy;
  notify: (message: string) => void;
  onNavigate: (view: string) => void;
  scope: Scope;
}) {
  const c = {
    fr: {
      synced: "● Synchronisé",
      demo: "○ Mode démonstration",
      history: "Historique",
      newTask: "Nouvelle tâche",
      reschedule: "Replanifier",
      sharedPlan: "PLAN DE TRAVAIL PARTAGÉ",
      create: "Créer une tâche",
      traceHint: "La création et les modifications seront tracées.",
      title: "Intitulé",
      titlePlaceholder: "Ex. Préparer le projet de conclusions",
      matter: "Dossier",
      owner: "Responsable",
      category: "Catégorie",
      task: "Tâche",
      urgent: "Échéance urgente",
      approval: "Validation",
      due: "Date et heure d’échéance",
      suggestion:
        "Proposition automatique : 4 h pour une urgence, 24 h pour une validation, 48 h pour une tâche normale.",
      priority: "Priorité",
      normal: "Normale",
      high: "Haute",
      low: "Basse",
      instructions: "Instructions",
      instructionsPlaceholder: "Résultat attendu et points de contrôle…",
      cancel: "Annuler",
      plan: "Planifier et tracer",
      audited: "REPLANIFICATION AUDITÉE",
      changeDue: "Modifier l’échéance",
      newDue: "Nouvelle date et heure",
      noMatter: "Aucun dossier lié",
      openWorkspace: "Ouvrir l’espace de travail lié",
      auditHint:
        "La modification sera enregistrée dans l’historique et le centre de notifications sera recalculé automatiquement.",
      saveDue: "Enregistrer la nouvelle échéance",
      traceability: "TRAÇABILITÉ",
      taskHistory: "Historique des tâches",
      latest: "Dernières opérations du cabinet",
      none: "Aucun événement enregistré",
      close: "Fermer",
      completed: "terminée",
      created: "créée",
      reassigned: "réaffectée",
      priorityChanged: "priorité modifiée",
      dueChanged: "échéance replanifiée",
      noDue: "Sans échéance",
      overdue: "En retard de",
      in: "Dans",
      createdNotice: "Tâche planifiée, tracée et intégrée aux alertes",
      createError: "Création non enregistrée",
      dueNotice: "Échéance replanifiée et alertes actualisées",
      actionError: "Action non enregistrée",
    },
    en: {
      synced: "● Synchronized",
      demo: "○ Demo mode",
      history: "History",
      newTask: "New task",
      reschedule: "Reschedule",
      sharedPlan: "SHARED WORK PLAN",
      create: "Create a task",
      traceHint: "Creation and changes will be recorded.",
      title: "Title",
      titlePlaceholder: "E.g. Prepare the draft submissions",
      matter: "Matter",
      owner: "Owner",
      category: "Category",
      task: "Task",
      urgent: "Urgent deadline",
      approval: "Approval",
      due: "Due date and time",
      suggestion:
        "Automatic suggestion: 4 h for an urgent item, 24 h for an approval, 48 h for a standard task.",
      priority: "Priority",
      normal: "Normal",
      high: "High",
      low: "Low",
      instructions: "Instructions",
      instructionsPlaceholder: "Expected outcome and control points…",
      cancel: "Cancel",
      plan: "Schedule and record",
      audited: "AUDITED RESCHEDULING",
      changeDue: "Change deadline",
      newDue: "New date and time",
      noMatter: "No linked matter",
      openWorkspace: "Open linked workspace",
      auditHint:
        "The change will be recorded in history and notifications will be recalculated automatically.",
      saveDue: "Save new deadline",
      traceability: "TRACEABILITY",
      taskHistory: "Task history",
      latest: "Latest firm operations",
      none: "No recorded event",
      close: "Close",
      completed: "completed",
      created: "created",
      reassigned: "reassigned",
      priorityChanged: "priority changed",
      dueChanged: "deadline rescheduled",
      noDue: "No deadline",
      overdue: "Overdue by",
      in: "In",
      createdNotice: "Task scheduled, recorded and added to alerts",
      createError: "Task was not saved",
      dueNotice: "Deadline rescheduled and alerts updated",
      actionError: "Action was not saved",
    },
    ar: {
      synced: "● متزامن",
      demo: "○ وضع العرض",
      history: "السجل",
      newTask: "مهمة جديدة",
      reschedule: "إعادة الجدولة",
      sharedPlan: "خطة العمل المشتركة",
      create: "إنشاء مهمة",
      traceHint: "سيتم تسجيل الإنشاء وجميع التعديلات.",
      title: "العنوان",
      titlePlaceholder: "مثال: إعداد مشروع المذكرة",
      matter: "الملف",
      owner: "المسؤول",
      category: "الفئة",
      task: "مهمة",
      urgent: "أجل مستعجل",
      approval: "مصادقة",
      due: "تاريخ ووقت الاستحقاق",
      suggestion:
        "اقتراح تلقائي: 4 ساعات للمستعجل، 24 ساعة للمصادقة، و48 ساعة للمهمة العادية.",
      priority: "الأولوية",
      normal: "عادية",
      high: "مرتفعة",
      low: "منخفضة",
      instructions: "التعليمات",
      instructionsPlaceholder: "النتيجة المنتظرة ونقاط المراقبة…",
      cancel: "إلغاء",
      plan: "جدولة وتسجيل",
      audited: "إعادة جدولة مدققة",
      changeDue: "تعديل الأجل",
      newDue: "التاريخ والوقت الجديدان",
      noMatter: "لا يوجد ملف مرتبط",
      openWorkspace: "فتح مساحة العمل المرتبطة",
      auditHint:
        "سيتم تسجيل التعديل في السجل وإعادة احتساب الإشعارات تلقائياً.",
      saveDue: "حفظ الأجل الجديد",
      traceability: "التتبع",
      taskHistory: "سجل المهام",
      latest: "آخر عمليات المكتب",
      none: "لا توجد عملية مسجلة",
      close: "إغلاق",
      completed: "مكتملة",
      created: "منشأة",
      reassigned: "أعيد إسنادها",
      priorityChanged: "تم تعديل الأولوية",
      dueChanged: "تمت إعادة جدولة الأجل",
      noDue: "بدون أجل",
      overdue: "متأخرة بـ",
      in: "خلال",
      createdNotice: "تمت جدولة المهمة وتسجيلها وإضافتها إلى التنبيهات",
      createError: "لم يتم حفظ المهمة",
      dueNotice: "تمت إعادة جدولة الأجل وتحديث التنبيهات",
      actionError: "لم يتم حفظ العملية",
    },
  }[lang];
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<Assignment[]>(fallbackAssignments);
  const [members, setMembers] = useState<Member[]>(fallbackMembers);
  const [viewer, setViewer] = useState<Viewer>({
    id: 1,
    fullName: "Sara Benali",
    role: "partner",
  });
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [taskCategory, setTaskCategory] =
    useState<Assignment["category"]>("task");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [rescheduleTask, setRescheduleTask] = useState<Assignment | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [now] = useState(() => Math.floor(Date.now() / 1000));
  const suggestedDueAt = (category: Assignment["category"]) => {
    const delay =
      category === "urgent" ? 4 : category === "approvals" ? 24 : 48;
    const date = new Date((now + delay * 3600) * 1000);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };
  const openTaskCreation = () => {
    setTaskCategory("task");
    setTaskDueAt(suggestedDueAt("task"));
    setCreateOpen(true);
  };
  const openReschedule = (item: Assignment) => {
    const date = new Date((item.dueAt || now) * 1000);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    setRescheduleAt(local.toISOString().slice(0, 16));
    setRescheduleTask(item);
  };
  useEffect(() => {
    fetch("/api/work", {
      headers: { accept: "application/json" },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{
          viewer: Viewer;
          assignments: Assignment[];
          members: Member[];
          events: WorkEvent[];
        }>;
      })
      .then((data) => {
        setViewer(data.viewer);
        setItems(data.assignments);
        setMembers(data.members);
        setEvents(data.events);
        setShared(true);
      })
      .catch(() => setShared(false));
  }, []);
  const createTask = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    const dueValue = String(data.get("dueAt") || "");
    const category = String(data.get("category") || "task");
    const defaultDelay =
      category === "urgent"
        ? 4 * 3600
        : category === "approvals"
          ? 24 * 3600
          : 48 * 3600;
    const payload = {
      title: String(data.get("title") || ""),
      description: String(data.get("description") || ""),
      category,
      targetView: "tasks",
      matterRef: String(data.get("matterRef") || ""),
      assigneeId: Number(data.get("assigneeId")),
      priority: String(data.get("priority") || "normal"),
      dueAt: dueValue
        ? Math.floor(new Date(dueValue).getTime() / 1000)
        : now + defaultDelay,
    };
    setBusy(-1);
    try {
      if (shared) {
        const response = await fetch("/api/work", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error();
        const refreshed = await fetch("/api/work", { cache: "no-store" });
        if (refreshed.ok) {
          const result = (await refreshed.json()) as {
            assignments: Assignment[];
            events: WorkEvent[];
          };
          setItems(result.assignments);
          setEvents(result.events);
        }
      } else {
        setItems((current) => [
          {
            id: Date.now(),
            externalRef: "DEMO",
            title: payload.title,
            description: payload.description,
            category: payload.category as Assignment["category"],
            targetView: "tasks",
            matterRef: payload.matterRef,
            priority: payload.priority as Priority,
            status: "open",
            dueAt: payload.dueAt || null,
            assigneeId: payload.assigneeId,
            assigneeName:
              members.find((member) => member.id === payload.assigneeId)
                ?.fullName || "",
            assigneeInitials:
              members.find((member) => member.id === payload.assigneeId)
                ?.initials || "",
          },
          ...current,
        ]);
      }
      notify(c.createdNotice);
      setCreateOpen(false);
    } catch {
      notify(c.createError);
    } finally {
      setBusy(null);
    }
  };
  const scoped = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === "open" &&
          (scope === "firm" || item.assigneeId === viewer.id),
      ),
    [items, scope, viewer.id],
  );
  const visible = scoped
    .filter((item) => tab === "all" || item.category === tab)
    .sort(
      (a, b) =>
        (a.dueAt ?? Number.MAX_SAFE_INTEGER) -
        (b.dueAt ?? Number.MAX_SAFE_INTEGER),
    );
  const patch = async (
    id: number,
    change: {
      assigneeId?: number;
      priority?: Priority;
      status?: "completed";
      dueAt?: number;
    },
  ) => {
    setBusy(id);
    try {
      if (shared) {
        const response = await fetch("/api/work", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ assignmentId: id, ...change }),
        });
        if (!response.ok) throw new Error();
      }
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...change,
                ...(change.assigneeId
                  ? {
                      assigneeName:
                        members.find(
                          (member) => member.id === change.assigneeId,
                        )?.fullName || item.assigneeName,
                      assigneeInitials:
                        members.find(
                          (member) => member.id === change.assigneeId,
                        )?.initials || item.assigneeInitials,
                    }
                  : {}),
              }
            : item,
        ),
      );
      notify(
        change.status ? t.complete : change.dueAt ? c.dueNotice : t.delegated,
      );
    } catch {
      notify(c.actionError);
    } finally {
      setBusy(null);
    }
  };
  const priorityLabel = (priority: Priority) =>
    priority === "high" ? c.high : priority === "normal" ? c.normal : c.low;
  const dueLabel = (dueAt: number | null) => {
    if (!dueAt) return c.noDue;
    const delta = dueAt - now;
    if (delta < 0)
      return `${c.overdue} ${Math.max(1, Math.ceil(Math.abs(delta) / 3600))} h`;
    if (delta < 86400)
      return `${c.in} ${Math.max(1, Math.ceil(delta / 3600))} h`;
    return new Date(dueAt * 1000).toLocaleString(
      lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-MA",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };
  const visuals = {
    urgent: ["!", "red"],
    approvals: ["✓", "amber"],
    task: ["□", "green"],
  } as const;
  return (
    <>
      <section className="work-queue panel shared-queue">
        <header>
          <div>
            <h2>{t.workQueue}</h2>
            <p>{t.workQueueHint}</p>
          </div>
          <span className={shared ? "sync-badge synced" : "sync-badge local"}>
            {shared ? c.synced : c.demo}
          </span>
          <div className="queue-actions">
            <button className="secondary" onClick={() => setHistoryOpen(true)}>
              ◷ {c.history}
            </button>
            <button className="primary" onClick={openTaskCreation}>
              ＋ {c.newTask}
            </button>
          </div>
          <div className="queue-tabs">
            <button
              className={tab === "all" ? "active" : ""}
              onClick={() => setTab("all")}
            >
              {t.all}
              <em>{scoped.length}</em>
            </button>
            <button
              className={tab === "urgent" ? "active" : ""}
              onClick={() => setTab("urgent")}
            >
              {t.urgent}
              <em>
                {scoped.filter((item) => item.category === "urgent").length}
              </em>
            </button>
            <button
              className={tab === "approvals" ? "active" : ""}
              onClick={() => setTab("approvals")}
            >
              {t.approvals}
              <em>
                {scoped.filter((item) => item.category === "approvals").length}
              </em>
            </button>
          </div>
        </header>
        <div className="queue-list">
          {visible.map((item) => (
            <article
              key={item.id}
              className={item.dueAt && item.dueAt < now ? "overdue" : ""}
            >
              <i className={visuals[item.category][1]}>
                {visuals[item.category][0]}
              </i>
              <div>
                <b>{item.title}</b>
                <span>
                  {item.matterRef && `${item.matterRef} • `}
                  {item.description}
                </span>
                <small
                  className={
                    item.dueAt && item.dueAt < now ? "due overdue-label" : "due"
                  }
                >
                  ◷ {dueLabel(item.dueAt)}
                </small>
              </div>
              <select
                aria-label={`${t.owner} — ${item.title}`}
                value={item.assigneeId}
                disabled={busy === item.id}
                onChange={(event) =>
                  void patch(item.id, {
                    assigneeId: Number(event.target.value),
                  })
                }
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.initials} · {member.fullName}
                  </option>
                ))}
              </select>
              <select
                aria-label={`${t.risk} — ${item.title}`}
                value={item.priority}
                disabled={busy === item.id}
                onChange={(event) =>
                  void patch(item.id, {
                    priority: event.target.value as Priority,
                  })
                }
              >
                {(["high", "normal", "low"] as Priority[]).map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </option>
                ))}
              </select>
              <button
                className="queue-open"
                onClick={() => openReschedule(item)}
              >
                ◷ {c.reschedule}
              </button>
              <button
                className="queue-done"
                disabled={busy === item.id}
                onClick={() => void patch(item.id, { status: "completed" })}
              >
                ✓ {t.complete}
              </button>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="queue-empty">✓ {t.noWork}</div>
          )}
        </div>
      </section>
      {createOpen && (
        <div className="modal-backdrop">
          <form
            className="intake-modal shared-task-modal"
            onSubmit={(event) => {
              event.preventDefault();
              void createTask(event.currentTarget);
            }}
          >
            <div className="modal-head">
              <div>
                <span>{c.sharedPlan}</span>
                <h2>{c.create}</h2>
                <p>{c.traceHint}</p>
              </div>
              <button type="button" onClick={() => setCreateOpen(false)}>
                ×
              </button>
            </div>
            <div className="task-form">
              <label className="wide">
                {c.title}
                <input name="title" required placeholder={c.titlePlaceholder} />
              </label>
              <label>
                {c.matter}
                <input name="matterRef" placeholder="IL-2026-0091" />
              </label>
              <label>
                {c.owner}
                <select name="assigneeId">
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {c.category}
                <select
                  name="category"
                  value={taskCategory}
                  onChange={(event) => {
                    const category = event.target
                      .value as Assignment["category"];
                    setTaskCategory(category);
                    setTaskDueAt(suggestedDueAt(category));
                  }}
                >
                  <option value="task">{c.task}</option>
                  <option value="urgent">{c.urgent}</option>
                  <option value="approvals">{c.approval}</option>
                </select>
              </label>
              <label className="wide">
                {c.due}
                <input
                  type="datetime-local"
                  name="dueAt"
                  required
                  value={taskDueAt}
                  min={suggestedDueAt("urgent")}
                  onChange={(event) => setTaskDueAt(event.target.value)}
                />
                <small>{c.suggestion}</small>
              </label>
              <label>
                {c.priority}
                <select name="priority">
                  <option value="normal">{c.normal}</option>
                  <option value="high">{c.high}</option>
                  <option value="low">{c.low}</option>
                </select>
              </label>
              <label className="wide">
                {c.instructions}
                <textarea
                  name="description"
                  placeholder={c.instructionsPlaceholder}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setCreateOpen(false)}
              >
                {c.cancel}
              </button>
              <button className="primary" disabled={busy === -1}>
                {c.plan}
              </button>
            </div>
          </form>
        </div>
      )}
      {rescheduleTask && (
        <div className="modal-backdrop">
          <form
            className="intake-modal reschedule-modal"
            onSubmit={(event) => {
              event.preventDefault();
              const dueAt = Math.floor(new Date(rescheduleAt).getTime() / 1000);
              void patch(rescheduleTask.id, { dueAt }).then(() => {
                setRescheduleTask(null);
              });
            }}
          >
            <div className="modal-head">
              <div>
                <span>{c.audited}</span>
                <h2>{c.changeDue}</h2>
                <p>{rescheduleTask.title}</p>
              </div>
              <button type="button" onClick={() => setRescheduleTask(null)}>
                ×
              </button>
            </div>
            <div className="reschedule-content">
              <label>
                {c.newDue}
                <input
                  type="datetime-local"
                  required
                  value={rescheduleAt}
                  onChange={(event) => setRescheduleAt(event.target.value)}
                />
              </label>
              <div>
                <span>{c.matter}</span>
                <b>{rescheduleTask.matterRef || c.noMatter}</b>
              </div>
              <button
                type="button"
                className="secondary reschedule-open"
                onClick={() => onNavigate(rescheduleTask.targetView)}
              >
                {c.openWorkspace}
              </button>
              <p>{c.auditHint}</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setRescheduleTask(null)}
              >
                {c.cancel}
              </button>
              <button className="primary" disabled={busy === rescheduleTask.id}>
                {c.saveDue}
              </button>
            </div>
          </form>
        </div>
      )}
      {historyOpen && (
        <div className="modal-backdrop">
          <section className="intake-modal work-history">
            <div className="modal-head">
              <div>
                <span>{c.traceability}</span>
                <h2>{c.taskHistory}</h2>
                <p>{c.latest}</p>
              </div>
              <button onClick={() => setHistoryOpen(false)}>×</button>
            </div>
            <div className="history-list">
              {events.length ? (
                events.map((event) => (
                  <article key={event.id}>
                    <i>◷</i>
                    <div>
                      <b>{event.title}</b>
                      <span>
                        {event.actorName} •{" "}
                        {event.details.startsWith("due_at:")
                          ? c.dueChanged
                          : event.action
                              .replace("priority_changed", c.priorityChanged)
                              .replace("reassigned", c.reassigned)
                              .replace("completed", c.completed)
                              .replace("created", c.created)}
                      </span>
                    </div>
                    <time>
                      {new Date(event.createdAt * 1000).toLocaleString()}
                    </time>
                  </article>
                ))
              ) : (
                <div className="queue-empty">{c.none}</div>
              )}
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={() => setHistoryOpen(false)}>
                {c.close}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
