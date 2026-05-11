/**
 * Brand logo used in layout header and sidebar.
 */
import { Link } from 'react-router-dom';

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export const Logo = ({ onClick, className = '' }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} onClick={onClick}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white p-1">
        <img src="/A1 logo img.png" alt="AIP Logo" className="h-7 w-7 object-contain" />
      </span>
      <span className="font-semibold text-lg">AIP</span>
    </Link>
  );
}; 