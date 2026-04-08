"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  SupportAgent as SupportAgentIcon,
  LanguageOutlined as LanguageIcon,
  KeyboardArrowDown as ArrowIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const NAV_LINKS = [
  { href: "/business/dashboard", label: "Dashboard",    icon: <DashboardIcon sx={{ fontSize: 17 }} /> },
  { href: "/business/learning",  label: "Aprendizaje",  icon: <SchoolIcon sx={{ fontSize: 17 }} /> },
  { href: "/business/support",   label: "Soporte",      icon: <SupportAgentIcon sx={{ fontSize: 17 }} /> },
];

export default function NavbarBusiness() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLocale = (next: string) => {
    router.replace(pathname, { locale: next });
    setLangAnchor(null);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--dark-blue)]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-[var(--dark-blue)]"
      }`}
    >
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--coppel-yellow)] via-[var(--secondary)] to-[var(--coppel-yellow)]" />

      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-6">

        {/* Logo + Badge */}
        <Link href="/business/dashboard" className="flex items-center gap-3 group">
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl text-white tracking-tight group-hover:text-[var(--secondary)] transition-colors">
              Mex<span className="text-[var(--secondary)]">GO</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">
              Negocios
            </span>
          </div>

        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <button
            onClick={(e) => setLangAnchor(e.currentTarget)}
            className="flex items-center gap-1 text-white/50 hover:text-white text-xs font-black uppercase tracking-widest transition-colors px-2 py-1.5"
          >
            <LanguageIcon sx={{ fontSize: 16 }} />
            {locale}
            <ArrowIcon sx={{ fontSize: 14 }} />
          </button>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={() => setLangAnchor(null)}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 130 } } }}
          >
            <MenuItem onClick={() => toggleLocale("es")} sx={{ fontSize: 14, fontWeight: 700 }}>🇲🇽 Español</MenuItem>
            <MenuItem onClick={() => toggleLocale("en")} sx={{ fontSize: 14, fontWeight: 700 }}>🇺🇸 English</MenuItem>
          </Menu>

          {/* Separator */}
          <div className="h-5 w-px bg-white/15" />

          {/* Profile dropdown */}
          <button
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/18 border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-xl transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--coppel-yellow)] flex items-center justify-center">
              <span className="text-[10px] font-black text-[var(--dark-blue)]">T</span>
            </div>
            <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors hidden sm:block">
              Mi negocio
            </span>
            <ArrowIcon sx={{ fontSize: 15 }} className="text-white/50" />
          </button>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 190 } } }}
          >
            <MenuItem
              onClick={() => { setProfileAnchor(null); router.push('/business/dashboard'); }}
              sx={{ fontSize: 14, fontWeight: 700, gap: 1.5 }}
            >
              <DashboardIcon fontSize="small" /> Mi dashboard
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => { setProfileAnchor(null); router.push('/'); }}
              sx={{ fontSize: 14, fontWeight: 700, color: 'error.main', gap: 1.5 }}
            >
              <LogoutIcon fontSize="small" /> Cerrar sesión
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex border-t border-white/10">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                isActive ? "text-[var(--secondary)] bg-white/5" : "text-white/40 hover:text-white/70"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
