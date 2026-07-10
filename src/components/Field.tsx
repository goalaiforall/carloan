interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
  optional?: boolean;
}

export function Field({ label, value, onChange, suffix, min = 0, step = 100, optional }: FieldProps) {
  return (
    <label className="field">
      <span>{label}{optional ? <em> optional</em> : null}</span>
      <div className="inputWrap">
        <input type="number" min={min} step={step} value={value} onChange={(event: any) => onChange(Number(event.target.value))} />
        {suffix ? <strong>{suffix}</strong> : null}
      </div>
    </label>
  );
}
