import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// 1. Official LeetCode Emblem SVG
export const LeetCodeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <path
      d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.314c.015-.016.034-.027.05-.042l3.9-3.923a1.382 1.382 0 0 0 .403-.974c0-.765-.615-1.375-1.375-1.375h-.625z"
      fill="#FFA116"
    />
    <path
      d="M9.833 10.925a1.378 1.378 0 0 0-.974 2.355l2.396 2.392a3.021 3.021 0 0 0 4.205-.038l.02.019 4.276 4.193c.652.64.972 1.469.948 2.263a2.68 2.68 0 0 1-.066.523 2.545 2.545 0 0 1-.619 1.164l-3.9 3.923a1.382 1.382 0 0 0-.403.974c0 .765.615 1.375 1.375 1.375h.625c.365 0 .714-.145.961-.438l5.406-5.788 3.854-4.126a5.266 5.266 0 0 0 1.209-2.104c.061-.17.103-.342.125-.513a5.527 5.527 0 0 0-.062-2.362 5.83 5.83 0 0 0-.349-1.017 5.938 5.938 0 0 0-1.271-1.818l-4.277-4.193-.039-.038c-2.248-2.165-5.852-2.133-8.063.074l-2.396 2.392a1.378 1.378 0 0 0-.403.974z"
      fill="#B3B1B0"
    />
    <path
      d="M8.406 14.364a1.375 1.375 0 0 0 0 2.75h10.5a1.375 1.375 0 0 0 0-2.75H8.406z"
      fill="#FFFFFF"
    />
  </svg>
);

// 2. Official Codeforces 3-Bar Emblem SVG
export const CodeforcesIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    {/* Yellow Bar (Left) */}
    <rect x="1.5" y="9" width="5.5" height="13" rx="1.5" fill="#FFD400" />
    {/* Blue Bar (Middle) */}
    <rect x="9.25" y="2" width="5.5" height="20" rx="1.5" fill="#1874D2" />
    {/* Red Bar (Right) */}
    <rect x="17" y="6" width="5.5" height="16" rx="1.5" fill="#EE2A24" />
  </svg>
);

// 3. Official GeeksforGeeks Signature { } Emblem SVG
export const GeeksforGeeksIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <rect width="24" height="24" rx="5" fill="#2F8D46" />
    <path
      d="M11.5 6C9 6 7 7.5 7 10v.5c0 1-.5 1.5-1.5 1.5 1 0 1.5.5 1.5 1.5V14c0 2.5 2 4 4.5 4M12.5 6c2.5 0 4.5 1.5 4.5 4v.5c0 1 .5 1.5 1.5 1.5-1 0-1.5.5-1.5 1.5V14c0 2.5-2 4-4.5 4"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. CodeChef Logo SVG
export const CodeChefIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <rect width="24" height="24" rx="5" fill="#5B4638" />
    <path
      d="M7 16h10c.5 0 1-.5 1-1v-2c0-2.2-1.8-4-4-4h-4c-2.2 0-4 1.8-4 4v2c0 .5.5 1 1 1z"
      fill="#FFFFFF"
    />
    <circle cx="9" cy="8" r="1.5" fill="#FFFFFF" />
    <circle cx="15" cy="8" r="1.5" fill="#FFFFFF" />
    <circle cx="12" cy="6.5" r="1.5" fill="#FFFFFF" />
  </svg>
);

// 5. Telegram Plane SVG
export const TelegramIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
  </svg>
);

// 6. Striver A2Z TakeUForward Emblem SVG
export const StriverIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <rect width="24" height="24" rx="5" fill="#E11D48" />
    <path
      d="M6 16l6-8 6 8H6z"
      fill="#FFFFFF"
    />
    <circle cx="12" cy="14" r="2" fill="#E11D48" />
  </svg>
);

// 7. NeetCode 150 Icon SVG
export const NeetCodeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    {...props}
  >
    <rect width="24" height="24" rx="5" fill="#0284C7" />
    <path
      d="M7 8l5 4-5 4V8zM12 8l5 4-5 4V8z"
      fill="#FFFFFF"
    />
  </svg>
);
