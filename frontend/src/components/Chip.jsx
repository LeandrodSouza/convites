function Chip({ icon, children, variant = 'default' }) {
  const variants = {
    default: 'bg-white border-border text-accent',
    brand: 'bg-[#E7F3EE] border-[#2E7D62]/20 text-[#2E7D62]',
    success: 'bg-[#E7F3EE] border-[#2E7D62]/20 text-[#2E7D62]',
    neutral: 'bg-[#F4F0E6] border-[#D9D4C7] text-[#121212]',
    muted: 'bg-[#F4F0E6] border-[#D9D4C7] text-gray-600'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap ${variants[variant]}`}>
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  );
}

export default Chip;
