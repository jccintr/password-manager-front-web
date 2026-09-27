import { Dropdown, DropdownItem } from 'flowbite-react';
import { useTheme } from '../context/ThemeContext';

const labels = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
};

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <Dropdown
      label={labels[preference] || 'Tema'}
      color="gray"
      size="sm"
      dismissOnClick
    >
      <DropdownItem onClick={() => setPreference('light')}>Claro</DropdownItem>
      <DropdownItem onClick={() => setPreference('dark')}>Escuro</DropdownItem>
      <DropdownItem onClick={() => setPreference('system')}>Sistema</DropdownItem>
    </Dropdown>
  );
}
