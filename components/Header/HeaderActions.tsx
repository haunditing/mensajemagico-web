import React from 'react';
import UserMenu from '../UserMenu';

interface HeaderActionsProps {
  triggerEasterEgg?: () => void;
}

/**
 * Acciones del header (Solo UserMenu)
 * Responsabilidad: Agrupar componentes de acción del usuario
 * Nota: CountrySelector movido al footer (disponible en página de inicio)
 */
const HeaderActions: React.FC<HeaderActionsProps> = () => {
  return (
    <div
      className="flex items-center gap-3 sm:gap-4"
      role="group"
      aria-label="Acciones del usuario"
    >
      <UserMenu />
    </div>
  );
};

export default React.memo(HeaderActions);
