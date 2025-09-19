interface ScoreHUDProps {
  items: { label: string; value: string | number }[];
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-100/70 px-3 py-2 text-center text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-300">{item.label}</span>
          <span className="text-lg font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
