import { useTranslation } from 'react-i18next';

const badgeConfig: Record<string, { icon: string; key: string }> = {
  'streak-3': { icon: '🔥', key: 'common:badge.streak3' },
  'streak-5': { icon: '⚡️', key: 'common:badge.streak5' },
  'streak-10': { icon: '🌟', key: 'common:badge.streak10' },
  'reaction-quick': { icon: '🚀', key: 'common:badge.reactionQuick' },
  'arithmetic-ace': { icon: '➕', key: 'common:badge.arithmeticAce' },
  'memory-marvel': { icon: '🧠', key: 'common:badge.memoryMarvel' }
};

interface BadgeListProps {
  badges: string[];
}

export const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  const { t } = useTranslation();
  if (badges.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">{t('common:noBadges')}</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        if (!config) return null;
        return (
          <li key={badge} className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2 shadow-sm dark:bg-slate-700/70">
            <span aria-hidden className="text-2xl">{config.icon}</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{t(config.key)}</span>
          </li>
        );
      })}
    </ul>
  );
};
