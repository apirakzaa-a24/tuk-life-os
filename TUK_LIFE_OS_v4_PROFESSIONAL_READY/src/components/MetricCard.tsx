type Props = { title: string; value: string; note: string };
export default function MetricCard({ title, value, note }: Props) {
  return (
    <section className="metric-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </section>
  );
}
