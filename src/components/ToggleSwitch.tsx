import { cn } from '../lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor?: string;
}

export const ToggleSwitch = ({
  checked,
  onChange,
  activeColor = 'bg-indigo-600',
}: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative w-10 h-6 rounded-full transition-colors",
      checked ? activeColor : "bg-slate-300"
    )}
  >
    <span className={cn(
      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
      checked ? "translate-x-[18px]" : "translate-x-0.5"
    )} />
  </button>
);
