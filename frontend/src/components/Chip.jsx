function Chip({ icon, children, variant = 'default' }) {
  const variants = {
    default: 'bg-white border-border text-accent',
    brand: 'bg-brand-light border-primary/20 text-primary',
    success: 'bg-green-50 border-green-200 text-green-700',
    neutral: 'bg-gray-100 border-gray-200 text-gray-700'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium ${variants[variant]}`}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

export default Chip;
