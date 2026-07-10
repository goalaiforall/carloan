interface ResultCardProps { label: string; value: string; tone?: 'good' | 'bad' | 'neutral'; note?: string; }
export function ResultCard({ label, value, tone = 'neutral', note }: ResultCardProps) {
  return <article className={`card ${tone}`}><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</article>;
}
