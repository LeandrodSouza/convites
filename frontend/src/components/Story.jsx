function Story({ icon, label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[72px]"
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
        active
          ? 'border-primary bg-brand-light'
          : 'border-border bg-white hover:border-primary/50'
      }`}>
        <div className="text-accent">
          {icon}
        </div>
      </div>
      <span className="text-xs text-accent text-center leading-tight max-w-[72px] line-clamp-2">
        {label}
      </span>
    </button>
  );
}

export default Story;
