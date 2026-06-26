export function todayThai() {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date());
}

export function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ');
}
