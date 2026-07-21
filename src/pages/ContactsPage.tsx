import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Instagram, Send } from "lucide-react";
import { sendMessage } from "../lib/contentService";
import { Seo } from "../components/Seo";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { site } from "../lib/site";
const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Проверьте email"),
  message: z.string().min(10, "Минимум 10 символов"),
});
type Form = z.infer<typeof schema>;
export default function ContactsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const [sent, setSent] = useState(false);
  const { lang, t } = useApp();
  const { user } = useAuth();
  const onSubmit = async (data: Form) => {
    await sendMessage({ ...data, userId: user?.uid });
    reset();
    setSent(true);
  };
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2">
      <Seo
        title={t.contacts}
        description="Свяжитесь с преподавателем английского."
      />
      <div>
        <h1 className="text-4xl font-black">{t.contacts}</h1>
        <p className="mt-4 text-slate-500">
          {lang === "ru"
            ? "Есть вопрос или хотите начать заниматься? Напишите мне."
            : "Savolingiz bormi yoki darsni boshlamoqchimisiz? Menga yozing."}
        </p>
        <p className="mt-7 font-semibold">makhmudovsherzodbek85@gmail.com</p>
        <div className="mt-5 grid gap-3">
          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-sky-500 px-5 py-4 font-bold text-white shadow-soft"
          >
            <Send />
            Telegram{" "}
            <span className="ml-auto text-sm font-normal">@leniviy_uchitel</span>
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-orange-400 px-5 py-4 font-bold text-white shadow-soft"
          >
            <Instagram />
            Instagram{" "}
            <span className="ml-auto text-sm font-normal">@leniviy_uchitel</span>
          </a>
        </div>
        {/* <p className="mt-3 text-xs text-slate-400">
          Ссылки меняются в src/lib/site.ts
        </p> */}
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <Field
          label={lang === "ru" ? "Имя" : "Ism"}
          error={errors.name?.message}
        >
          <input {...register("name")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" />
        </Field>
        <Field
          label={lang === "ru" ? "Сообщение" : "Xabar"}
          error={errors.message?.message}
        >
          <textarea {...register("message")} rows={5} />
        </Field>
        {sent && (
          <p className="mb-3 text-green-600">
            {lang === "ru" ? "Сообщение отправлено!" : "Xabar yuborildi!"}
          </p>
        )}
        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white"
        >
          {t.send}
        </button>
      </form>
    </section>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block text-sm font-semibold">
      {label}
      <div className="mt-1 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:bg-transparent [&_input]:p-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:bg-transparent [&_textarea]:p-3 dark:[&_input]:border-slate-700 dark:[&_textarea]:border-slate-700">
        {children}
      </div>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </label>
  );
}
