import {
  LuLayoutDashboard,
  LuGalleryVerticalEnd,
  LuMessageSquareQuote,
  LuLayoutTemplate,
  LuTag,
  LuHouse,
  LuUser,
  LuUsers,
  LuMail,
} from "react-icons/lu";


export const SIDE_MENU_DATA = [
  {
    id: "00",
    label: "Home",
    icon: LuHouse,
    path: "/",
  },
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },

  {
    id: "02",
    label: "Blog Posts",
    icon: LuGalleryVerticalEnd,
    path: "/admin/posts",
  },

  {
    id: "03",
    label: "Comments",
    icon: LuMessageSquareQuote,
    path: "/admin/comments",
  },

  {
    id: "04",
    label: "Profile",
    icon: LuUser,
    path: "/admin/profile",
  },
  {
    id: "05",
    label: "Users",
    icon: LuUsers,
    path: "/admin/users",
  },
];

export const BLOG_NAVBAR_DATA = [
  {
    id: "01",
    label: "Home",
    icon: LuLayoutTemplate,
    path: "/",
  },
  {
    id: "02",
    label: "Sustainability",
    icon: LuTag,
    path: "/tag/Sustainability",
  },
  {
    id: "03",
    label: "Renewable Energy",
    icon: LuTag,
    path: "/tag/Renewable Energy",
  },
  {
    id: "04",
    label: "What's New",
    icon: LuTag,
    path: "/tag/What's New",
  },
  {
    id: "05",
    label: "Contact",
    icon: LuMail,
    path: "/contact",
  },
]
