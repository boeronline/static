interface TestCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const TestCard: React.FC<TestCardProps> = ({ title, description, children, footer }) => {
  return (
    <section className="card-transition rounded-3xl bg-white/90 dark:bg-slate-800/80 backdrop-blur px-4 py-5 shadow-md">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </header>
      <div className="space-y-4 text-lg">{children}</div>
      {footer ? <footer className="mt-4 flex justify-end">{footer}</footer> : null}
    </section>
  );
};
