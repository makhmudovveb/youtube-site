import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
const schema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  birthYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  telegram: z.string().trim().max(64).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const { login, register: signup, loginWithGoogle } = useAuth();
  const { lang } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const submit = async (v: Values) => {
    try {
      setError("");
      if (mode === "login") await login(v.email, v.password);
      else {
        if (!v.firstName || !v.lastName || !v.birthYear)
          throw new Error("Заполните имя, фамилию и год рождения.");
        await signup(v.email, v.password, {
          firstName: v.firstName,
          lastName: v.lastName,
          birthYear: v.birthYear,
          telegram: v.telegram?.replace(/^@/, "") || "",
        });
      }
      nav("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа.");
    }
  };
  const google = async () => {
    try {
      await loginWithGoogle();
      nav("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка Google входа.");
    }
  };
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <form
        onSubmit={handleSubmit(submit)}
        className="rounded-2xl bg-white p-7 shadow-soft dark:bg-slate-900"
      >
        <h1 className="text-3xl font-black">
          {mode === "login"
            ? lang === "ru"
              ? "Вход"
              : "Kirish"
            : lang === "ru"
              ? "Регистрация"
              : "Ro‘yxatdan o‘tish"}
        </h1>
        {mode === "register" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Input
              label={lang === "ru" ? "Имя" : "Ism"}
              {...register("firstName")}
            />
            <Input
              label={lang === "ru" ? "Фамилия" : "Familiya"}
              {...register("lastName")}
            />
            <label className="col-span-2 text-sm">
              {lang === "ru" ? "Год рождения" : "Tug‘ilgan yil"}
              <input
                type="number"
                className="mt-1 w-full rounded-xl border bg-transparent p-3 dark:border-slate-700"
                {...register("birthYear")}
              />
            </label>
            <Input
              label="Telegram (необязательно)"
              placeholder="@username"
              className="col-span-2 mt-1 w-full rounded-xl border bg-transparent p-3 dark:border-slate-700"
              {...register("telegram")}
            />
          </div>
        )}
        <label className="mt-5 block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-xl border bg-transparent p-3 dark:border-slate-700"
            {...register("email")}
          />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full rounded-xl border bg-transparent p-3 pr-12 dark:border-slate-700"
              {...register("password")}
            />
            <button
              type="button"
              aria-label="Показать пароль"
              onClick={() => setShowPassword((x) => !x)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </label>
        {(errors.email || errors.password || errors.birthYear) && (
          <p className="mt-2 text-sm text-rose-500">
            Проверьте заполненные поля.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-bold text-white"
        >
          {mode === "login"
            ? lang === "ru"
              ? "Войти"
              : "Kirish"
            : lang === "ru"
              ? "Создать аккаунт"
              : "Akkaunt yaratish"}
        </button>
        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-xl border py-3 font-bold dark:border-slate-700"
        >
          G&nbsp;{" "}
          {lang === "ru" ? "Продолжить с Google" : "Google bilan davom etish"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-sm text-brand-600"
        >
          {mode === "login"
            ? lang === "ru"
              ? "Нет аккаунта? Регистрация"
              : "Akkaunt yo‘qmi? Ro‘yxatdan o‘ting"
            : lang === "ru"
              ? "Уже есть аккаунт? Войти"
              : "Akkaunt bormi? Kiring"}
        </button>
      </form>
    </section>
  );
}
const Input = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className={props.className || "text-sm"}>
    {label}
    <input
      className="mt-1 w-full rounded-xl border bg-transparent p-3 dark:border-slate-700"
      {...props}
    />
  </label>
);
