import { Seo } from "../components/Seo";
import { useApp } from "../context/AppContext";
export default function AboutPage() {
  const { lang, t } = useApp();
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-[.8fr_1.2fr]">
      <Seo title={t.about} description="Преподаватель английского языка." />
      <img
        className="h-96 w-full rounded-3xl object-cover"
        src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=700&q=80"
        alt="Teacher"
      />
      <div>
        <p className="font-bold text-brand-600">Hello!</p>
        <h1 className="mt-2 text-4xl font-black">
          {lang === "ru"
            ? "Я Шерзодбек — ваш преподаватель английского"
            : "Men Sherzodbek — ingliz tili o‘qituvchingizman"}
        </h1>
        <p className="mt-6 leading-8 text-slate-600 dark:text-slate-300">
          {lang === "ru"
            ? "Я помогаю взрослым студентам перестать бояться говорить. Мои уроки — это спокойная поддержка, современные темы и много понятной практики."
            : "Men katta yoshdagi o‘quvchilarga gapirish qo‘rquvini yengishga yordam beraman. Darslarim tinch qo‘llab-quvvatlash, zamonaviy mavzular va ko‘p tushunarli amaliyotdir."}
        </p>
        <div className="mt-7 grid grid-cols-3 gap-3 text-center">
          <b className="rounded-xl bg-brand-50 p-3 text-brand-600">
            3+<small className="block text-slate-500">years</small>
          </b>
          <b className="rounded-xl bg-brand-50 p-3 text-brand-600">
            10+<small className="block text-slate-500">students</small>
          </b>
          <b className="rounded-xl bg-brand-50 p-3 text-brand-600">
            4.9<small className="block text-slate-500">rating</small>
          </b>
        </div>
      </div>
    </section>
  );
}
