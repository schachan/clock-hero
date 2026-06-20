interface KeypadProps {
  ready: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onCheck: () => void;
}

export function Keypad({ ready, onDigit, onBackspace, onCheck }: KeypadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="keypad">
      {digits.map((d) => (
        <button key={d} className="key" type="button" onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button className="key del" type="button" onClick={onBackspace}>
        ⌫
      </button>
      <button className="key" type="button" onClick={() => onDigit("0")}>
        0
      </button>
      <button className="key check" type="button" disabled={!ready} onClick={onCheck}>
        ✓ Go
      </button>
    </div>
  );
}
