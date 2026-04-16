export function SectionCard({
  title,
  children,
  fullWidth = false,
  className = "",
  headerExtra = null,
  bodyClassName = "",
}) {
  return (
    <section className={`section-card ${fullWidth ? "full-width" : ""} ${className}`.trim()}>
      <div className="card-header">
        <span>{title}</span>
        {headerExtra}
      </div>
      <div className={`card-body ${bodyClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
