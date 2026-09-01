import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Mail, Pencil, Save, Send, ShieldCheck, UserRound, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendChatMessage } from "../lib/contentService";
import { Seo } from "../components/Seo";
import { PageLoader } from "../components/PageLoader";

const currentYear = new Date().getFullYear();
const schema = z.object({
  firstName: z.string().trim().min(2, "Минимум 2 символа"),
  lastName: z.string().trim().min(2, "Минимум 2 символа"),
  email: z.string().trim().email("Проверьте email"),
  birthYear: z.string().regex(/^\d{4}$/, "Введите год из 4 цифр").refine(value => Number(value) >= 1900 && Number(value) <= currentYear, "Укажите корректный год"),
  telegram: z.string().trim().max(64, "Не более 64 символов"),
});
type Values = z.infer<typeof schema>;

/** Профиль и его редактирование; изменения дополнительно фиксируются в личном чате. */
export default function ProfilePage() {
  const { user, profile, isAdmin, loading, updateAccount } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");
  const [saveError, setSaveError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", birthYear: "", telegram: "" },
  });

  useEffect(() => {
    if (!user) return;
    reset({ firstName: profile?.firstName || user.displayName?.split(" ")[0] || "", lastName: profile?.lastName || user.displayName?.split(" ").slice(1).join(" ") || "", email: user.email || "", birthYear: profile?.birthYear ? String(profile.birthYear) : "", telegram: profile?.telegram || "" });
  }, [profile, reset, user]);

  if (loading) return <PageLoader label="Загружаем профиль…" />;
  if (!user) return <Navigate to="/login" replace />;
  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : user.displayName || "User";

  const save = async (values: Values) => {
    const oldName = name; const nextName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim(); const oldEmail = user.email || "не указан"; const nextEmail = values.email.trim(); const oldTelegram = profile?.telegram ? `@${profile.telegram}` : "не указан"; const nextTelegram = values.telegram.trim().replace(/^@/, ""); const changes: string[] = [];
    if (oldName !== nextName) changes.push(`Имя изменено: «${oldName}» → «${nextName}».`);
    if (oldEmail !== nextEmail) changes.push(`Email изменён: «${oldEmail}» → «${nextEmail}».`);
    if ((profile?.telegram || "") !== nextTelegram) changes.push(`Telegram изменён: «${oldTelegram}» → «${nextTelegram ? `@${nextTelegram}` : "не указан"}».`);
    try {
      setSaveError(""); setSaved("");
      await updateAccount({ ...values, birthYear: Number(values.birthYear), telegram: nextTelegram, email: nextEmail });
      // Сообщение отправляется от владельца аккаунта: это соответствует Firestore Rules.
      if (changes.length) await sendChatMessage(user.uid, { senderId: user.uid, senderName: nextName, text: `Системное уведомление профиля:\n${changes.join("\n")}` });
      setEditing(false); setSaved(changes.length ? "Данные сохранены, уведомление добавлено в чат." : "Данные сохранены.");
    } catch (error) {
      const code = (error as { code?: string }).code;
      setSaveError(code === "auth/requires-recent-login" ? "Для смены email выйдите из аккаунта, войдите снова и повторите попытку." : error instanceof Error ? error.message : "Не удалось сохранить данные.");
    }
  };

  return <section className="mx-auto max-w-2xl px-4 py-12"><Seo title="Профиль" description="Профиль пользователя Leniviy Uchitel." /><div className="overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-slate-900"><div className="h-28 bg-gradient-to-r from-brand-600 to-sky-400" /><div className="px-7 pb-7"><div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-brand-50 text-brand-600 shadow dark:border-slate-900"><UserRound size={44} /></div><div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black">{name}</h1><span className={"rounded-full px-3 py-1 text-xs font-bold " + (isAdmin ? "bg-amber-100 text-amber-800" : "bg-brand-50 text-brand-600")}>{isAdmin ? "ADMIN" : "USER"}</span></div><p className="mt-1 text-slate-500">{user.email}</p>
    {!editing ? <><div className="mt-7 grid gap-3 sm:grid-cols-2"><Info icon={<Mail size={18} />} label="Email" value={user.email || "—"} /><Info icon={<CalendarDays size={18} />} label="Год рождения" value={profile?.birthYear ? String(profile.birthYear) : "Не указан"} /><Info icon={<Send size={18} />} label="Telegram" value={profile?.telegram ? `@${profile.telegram}` : "Не указан"} /><Info icon={<ShieldCheck size={18} />} label="Роль" value={isAdmin ? "Администратор" : "Пользователь"} /></div>{saved && <p className="mt-5 text-sm font-medium text-green-600">{saved}</p>}<div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => { setSaved(""); setEditing(true); }} className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold dark:border-slate-700"><Pencil size={18} />Изменить профиль</button><Link to="/chat" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white"><MessageCircle size={19} />Чат с преподавателем</Link></div></> : <form onSubmit={handleSubmit(save)} className="mt-7"><h2 className="text-xl font-bold">Редактирование профиля</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Имя" error={errors.firstName?.message}><input disabled={isSubmitting} {...register("firstName")} /></Field><Field label="Фамилия" error={errors.lastName?.message}><input disabled={isSubmitting} {...register("lastName")} /></Field><Field label="Email" error={errors.email?.message} className="sm:col-span-2"><input type="email" disabled={isSubmitting} {...register("email")} /></Field><Field label="Год рождения" error={errors.birthYear?.message}><input inputMode="numeric" maxLength={4} disabled={isSubmitting} {...register("birthYear")} /></Field><Field label="Telegram" error={errors.telegram?.message}><input placeholder="@username" disabled={isSubmitting} {...register("telegram")} /></Field></div>{saveError && <p role="alert" className="mt-3 text-sm text-rose-500">{saveError}</p>}<div className="mt-5 flex gap-3"><button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white disabled:opacity-60"><Save size={18} />{isSubmitting ? "Сохраняем…" : "Сохранить"}</button><button type="button" disabled={isSubmitting} onClick={() => { setSaveError(""); setEditing(false); }} className="rounded-xl border px-5 py-3 font-bold dark:border-slate-700">Отмена</button></div></form>}
  </div></div></section>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><span className="text-brand-600">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="font-semibold">{value}</p></div></div>; }
function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={(className || "") + " block text-sm font-semibold"}>{label}<span className="mt-1 block [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:bg-transparent [&_input]:p-3 dark:[&_input]:border-slate-700">{children}</span>{error && <span className="text-xs font-normal text-rose-500">{error}</span>}</label>; }
