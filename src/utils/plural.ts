const rules = new Intl.PluralRules('ru');

/** Русское склонение по числу: plural(5, ['вкус', 'вкуса', 'вкусов']) → «вкусов». */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  const category = rules.select(n);
  if (category === 'one') return one;
  if (category === 'few') return few;
  return many;
}
