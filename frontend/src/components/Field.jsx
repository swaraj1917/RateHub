import { useId, useState } from "react";

// Labelled input with inline error + hint. type="textarea" and type="select" are supported.
export default function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  hint,
  children,
  className = "",
  ...rest
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  const shared = {
    id,
    name,
    value,
    onChange,
    onBlur,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    ...rest,
  };

  let control;

  if (type === "textarea") {
    control = <textarea className="textarea" {...shared} />;
  } else if (type === "select") {
    control = (
      <select className="select" {...shared}>
        {children}
      </select>
    );
  } else if (type === "password") {
    control = (
      <div className="password-wrap">
        <input className="input" type={show ? "text" : "password"} {...shared} />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    );
  } else {
    control = <input className="input" type={type} {...shared} />;
  }

  return (
    <div className={`field${error ? " has-error" : ""} ${className}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {error ? (
        <span id={`${id}-err`} className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
