import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle, Button } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function AppNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar fluid rounded className="border-b border-gray-200 dark:border-gray-700">
      <NavbarBrand as={Link} to={isAuthenticated ? '/' : '/login'}>
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
          Cofre
        </span>
      </NavbarBrand>
      <div className="flex items-center gap-2 md:order-2">
        <ThemeToggle />
        {isAuthenticated && (
          <Button color="gray" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        )}
        <NavbarToggle />
      </div>
      {isAuthenticated && (
        <NavbarCollapse>
          <NavbarLink as={Link} to="/" active>
            Senhas
          </NavbarLink>
          <NavbarLink as={Link} to="/items/new">
            Nova senha
          </NavbarLink>
          <span className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 md:hidden">
            {user?.email}
          </span>
        </NavbarCollapse>
      )}
    </Navbar>
  );
}
