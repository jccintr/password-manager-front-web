import { Dropdown, DropdownItem } from 'flowbite-react';
import { useTheme } from '../context/ThemeContext';
import { IconSun, IconMoon, IconMonitor } from './Icons';

const options = [
  { value: 'light', label: 'Claro', Icon: IconSun },
  { value: 'dark', label: 'Escuro', Icon: IconMoon },
  { value: 'system', label: 'Sistema', Icon: IconMonitor },
];

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const current = options.find((o) => o.value === preference) || options[2];
  const CurrentIcon = current.Icon;

  return (
    <Dropdown
      label={
        <span className="flex items-center gap-1.5">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{current.label}</span>
        </span>
      }
      color="gray"
      size="sm"
      dismissOnClick
    >
      {options.map(({ value, label, Icon }) => (
        <DropdownItem key={value} onClick={() => setPreference(value)}>
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
            {preference === value && (
              <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">✓</span>
            )}
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
