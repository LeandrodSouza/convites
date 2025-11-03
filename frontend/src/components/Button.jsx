function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  fullWidth = false,
  disabled = false,
  onClick,
  ...props
}) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg',
    secondary: 'bg-white border border-border text-accent hover:bg-secondary',
    ghost: 'text-primary hover:bg-brand-light',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
