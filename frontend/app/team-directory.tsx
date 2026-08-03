"use client";

import { useEffect, useMemo, useState } from "react";
import "./team-directory.css";

type Lang = "fr" | "en" | "ar";
type Role = "partner" | "manager" | "lawyer" | "associate" | "admin";
type Status = "active" | "invited" | "disabled";
type Member = { id:number; email:string; fullName:string; initials:string; role:Role; status:Status; locale:Lang };
type Viewer = Pick<Member,"id"|"email"|"fullName"|"role"|"status"|"locale">;

const labels = {
  fr:{title:"Registre partagé du cabinet",hint:"Utilisateurs, rôles et accès centralisés",connected:"Utilisateur connecté",members:"membres",active:"Actif",invited:"Invité",disabled:"Désactivé",partner:"Associé",manager:"Responsable",lawyer:"Avocat",associate:"Collaborateur",admin:"Administration",role:"Rôle",status:"Statut",save:"Enregistrer",loading:"Chargement du registre partagé…",unavailable:"Le registre partagé sera disponible dans l’environnement sécurisé du cabinet.",forbidden:"Votre compte ne figure pas parmi les membres actifs du cabinet.",readOnly:"Consultation uniquement",canManage:"Gestion des accès autorisée",saved:"Rôle et statut mis à jour",retry:"Réessayer"},
  en:{title:"Shared firm directory",hint:"Centralized users, roles and access",connected:"Signed-in user",members:"members",active:"Active",invited:"Invited",disabled:"Disabled",partner:"Partner",manager:"Manager",lawyer:"Lawyer",associate:"Associate",admin:"Administration",role:"Role",status:"Status",save:"Save",loading:"Loading the shared directory…",unavailable:"The shared directory will be available in the firm’s secure environment.",forbidden:"Your account is not listed as an active firm member.",readOnly:"Read-only access",canManage:"Access management enabled",saved:"Role and status updated",retry:"Retry"},
  ar:{title:"السجل المشترك للمكتب",hint:"المستخدمون والأدوار والصلاحيات في مكان واحد",connected:"المستخدم المتصل",members:"أعضاء",active:"نشط",invited:"مدعو",disabled:"معطل",partner:"شريك",manager:"مسؤول",lawyer:"محام",associate:"متعاون",admin:"الإدارة",role:"الدور",status:"الحالة",save:"حفظ",loading:"جار تحميل السجل المشترك…",unavailable:"سيكون السجل المشترك متاحاً داخل البيئة الآمنة للمكتب.",forbidden:"حسابك غير مسجل ضمن الأعضاء النشطين في المكتب.",readOnly:"عرض فقط",canManage:"إدارة الصلاحيات متاحة",saved:"تم تحديث الدور والحالة",retry:"إعادة المحاولة"},
};
const roles:Role[]=["partner","manager","lawyer","associate","admin"];
const statuses:Status[]=["active","invited","disabled"];

export function TeamDirectory({lang,notify}:{lang:Lang;notify:(message:string)=>void}){
  const [members,setMembers]=useState<Member[]>([]); const [viewer,setViewer]=useState<Viewer|null>(null);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<"forbidden"|"unavailable"|null>(null); const [saving,setSaving]=useState<number|null>(null);
  const t=labels[lang];
  const load=()=>fetch("/api/team",{headers:{accept:"application/json"},cache:"no-store"}).then(async response=>{if(response.status===403)throw new Error("forbidden");if(!response.ok)throw new Error("unavailable");return response.json() as Promise<{viewer:Viewer;members:Member[]}>}).then(data=>{setViewer(data.viewer);setMembers(data.members)}).catch((reason:Error)=>setError(reason.message==="forbidden"?"forbidden":"unavailable")).finally(()=>setLoading(false));
  useEffect(()=>{fetch("/api/team",{headers:{accept:"application/json"},cache:"no-store"}).then(async response=>{if(response.status===403)throw new Error("forbidden");if(!response.ok)throw new Error("unavailable");return response.json() as Promise<{viewer:Viewer;members:Member[]}>}).then(data=>{setViewer(data.viewer);setMembers(data.members)}).catch((reason:Error)=>setError(reason.message==="forbidden"?"forbidden":"unavailable")).finally(()=>setLoading(false))},[]);
  const canManage=viewer?.role==="partner"||viewer?.role==="admin"; const activeCount=useMemo(()=>members.filter(member=>member.status==="active").length,[members]);
  const updateLocal=(id:number,field:"role"|"status",value:Role|Status)=>setMembers(current=>current.map(member=>member.id===id?{...member,[field]:value}:member));
  const save=async(member:Member)=>{setSaving(member.id);try{const response=await fetch("/api/team",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({memberId:member.id,role:member.role,status:member.status})});if(!response.ok)throw new Error();notify(t.saved)}catch{notify(t.unavailable)}finally{setSaving(null)}};
  return <section className="team-directory panel"><header className="team-directory-head"><div><span>INTEGER LEGAL • IAM</span><h2>{t.title}</h2><p>{t.hint}</p></div><div className="directory-count"><b>{activeCount}</b><span>{t.members}</span></div></header>
    {loading&&<div className="directory-state"><i>◎</i><span>{t.loading}</span></div>}
    {!loading&&error&&<div className="directory-state warning"><i>!</i><span>{error==="forbidden"?t.forbidden:t.unavailable}</span><button className="secondary" onClick={()=>{setLoading(true);setError(null);void load()}}>{t.retry}</button></div>}
    {!loading&&!error&&viewer&&<><div className="viewer-strip"><span className="member-avatar viewer">{viewer.fullName.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><small>{t.connected}</small><b>{viewer.fullName}</b><span>{viewer.email}</span></div><em>{t[viewer.role]}</em><i className={canManage?"manage":"readonly"}>{canManage?t.canManage:t.readOnly}</i></div>
      <div className="directory-table"><div className="directory-row directory-header"><span>{t.members}</span><span>{t.role}</span><span>{t.status}</span><span/></div>{members.map(member=><div className="directory-row" key={member.id}><span className="member-identity"><i className="member-avatar">{member.initials}</i><span><b>{member.fullName}</b><small>{member.email}</small></span></span><select aria-label={`${t.role} — ${member.fullName}`} value={member.role} disabled={!canManage||saving===member.id} onChange={event=>updateLocal(member.id,"role",event.target.value as Role)}>{roles.map(role=><option key={role} value={role}>{t[role]}</option>)}</select><select aria-label={`${t.status} — ${member.fullName}`} value={member.status} disabled={!canManage||saving===member.id} onChange={event=>updateLocal(member.id,"status",event.target.value as Status)}>{statuses.map(status=><option key={status} value={status}>{t[status]}</option>)}</select><button className="secondary directory-save" disabled={!canManage||saving===member.id} onClick={()=>void save(member)}>{saving===member.id?"…":t.save}</button></div>)}</div></>}
  </section>
}
