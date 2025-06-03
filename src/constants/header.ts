// User data
export const USER_DATA = {
  name: "David Ibanga",
  role: "IT manager",
  email: "David.Ibanga@advantage1.co.uk",
  avatar: "https://avatars.githubusercontent.com/u/47346863?s=400&u=f3910523f6f994655d3d57ef1cbcbbef491f3bea&v=4",
  initials: "DI"
} as const;

// Common button styles
export const BUTTON_STYLES = {
  ghost: {
    mobile: "p-0 text-white hover:bg-slate-700",
    desktop: "p-0 rounded-full"
  },
  outline: {
    mobile: "w-full h-10 gap-1 bg-blue-900 text-white border-blue-800 justify-between hover:bg-blue-800 hover:text-white",
    desktop: "h-9 gap-1 md:bg-blue-900 md:text-white md:border-blue-800 lg:bg-white lg:text-black lg:border-gray-200"
  }
} as const;

// Common class names
export const COMMON_CLASSES = {
  mobileHeader: "md:hidden flex h-18 items-center justify-between px-5 bg-[#334155]",
  desktopHeader: "hidden md:flex h-20 items-center px-4 bg-[#334155] lg:bg-white",
  sheetContent: "w-[340px] sm:w-[400px] p-0 flex flex-col h-full bg-blue-950 text-white border-r-blue-900",
  searchInput: "w-full pl-9 h-9 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
} as const;

// Navigation related constants
export const NOTIFICATION_COUNT = 3;
export const LOGO_SIZES = {
  mobile: "h-20",
  sheet: "h-24",
  ipad: "h-17"
} as const; 