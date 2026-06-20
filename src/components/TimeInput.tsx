import type { ActiveBox } from "../types";

interface TimeInputProps {
  answerH: string;
  answerM: string;
  activeBox: ActiveBox;
  locked: boolean;
  onSelectBox: (box: ActiveBox) => void;
}

export function TimeInput({ answerH, answerM, activeBox, locked, onSelectBox }: TimeInputProps) {
  return (
    <>
      <div className="labels-row">
        <div className="box-label">HOUR</div>
        <div className="box-label">MINUTES</div>
      </div>
      <div className="answer-row">
        <div
          className={`timebox${activeBox === "h" ? " active" : ""}`}
          onClick={() => {
            if (!locked) onSelectBox("h");
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (!locked) onSelectBox("h");
            }
          }}
        >
          {answerH === "" ? <span className="ph">--</span> : answerH}
        </div>
        <div className="colon">:</div>
        <div
          className={`timebox${activeBox === "m" ? " active" : ""}`}
          onClick={() => {
            if (!locked) onSelectBox("m");
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (!locked) onSelectBox("m");
            }
          }}
        >
          {answerM === "" ? <span className="ph">--</span> : answerM}
        </div>
      </div>
    </>
  );
}
