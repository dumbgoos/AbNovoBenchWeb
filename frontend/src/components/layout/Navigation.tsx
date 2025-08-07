"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingLink } from '@/components/ui/LoadingButton';
import { MagneticHover } from '@/components/ui/AnimatedComponents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/models', label: 'Models' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/datasets', label: 'Datasets' },
    { href: '/evaluation', label: 'Evaluation' },
    { href: '/submit', label: 'Submit' },
    { href: '/about', label: 'About' },
    { href: '/news', label: 'News' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById('mobile-menu');
      if (nav && !nav.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (username?: string) => {
    if (!username || typeof username !== 'string') return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (href: string) => pathname === href;

  // Preload route on hover for faster navigation
  const handleMouseEnter = (href: string) => {
    router.prefetch(href);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50 animate-slide-in-down">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <MagneticHover>
            <Link href="/" className="flex items-center space-x-2 group" onMouseEnter={() => handleMouseEnter('/')}>
              <div className="w-8 h-8 bg-gradient-to-r from-[#5f57d3] to-[#4a51be] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">Ab</span>
              </div>
              <span className="font-bold text-xl text-[#333366] group-hover:text-[#5f57d3] transition-colors duration-200">
                AbNovoBench
              </span>
            </Link>
          </MagneticHover>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <div key={item.href} className="nav-item">
                <Link
                  href={item.href}
                  className={`
                    nav-link nav-hover-effect px-3 py-2 rounded-lg font-medium text-sm
                    ${isActive(item.href) 
                      ? 'bg-[#5f57d3] text-white shadow-md active' 
                      : 'text-gray-600 hover:text-[#5f57d3] hover:bg-[#5f57d3]/10'
                    }
                  `}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-[#5f57d3] to-[#4a51be] text-white">
                        {getUserInitials(user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 animate-slide-in-up" 
                  align="end"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center hover:bg-[#5f57d3]/10 transition-colors duration-200">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center hover:bg-[#5f57d3]/10 transition-colors duration-200">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  asChild
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-[#5f57d3] to-[#4a51be] hover:from-[#4a51be] hover:to-[#5f57d3] hover:scale-105 transition-all duration-200"
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="hover:scale-110 transition-transform duration-200"
            >
              <div className="transform transition-transform duration-200">
                {isMobileMenuOpen ? 
                  <X className="h-6 w-6" /> : 
                  <Menu className="h-6 w-6" />
                }
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm rounded-lg mt-2 border">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  mobile-nav-item block px-3 py-2 rounded-lg font-medium
                  ${isActive(item.href) 
                    ? 'bg-[#5f57d3] text-white' 
                    : 'text-gray-600 hover:text-[#5f57d3] hover:bg-[#5f57d3]/10'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={() => handleMouseEnter(item.href)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            <div className="border-t pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="font-medium text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="mobile-nav-item block px-3 py-2 text-gray-600 hover:text-[#5f57d3] hover:bg-[#5f57d3]/10 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="mobile-nav-item block px-3 py-2 text-gray-600 hover:text-[#5f57d3] hover:bg-[#5f57d3]/10 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mobile-nav-item block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="mobile-nav-item block px-3 py-2 text-gray-600 hover:text-[#5f57d3] hover:bg-[#5f57d3]/10 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="mobile-nav-item block px-3 py-2 bg-gradient-to-r from-[#5f57d3] to-[#4a51be] text-white rounded-lg hover:from-[#4a51be] hover:to-[#5f57d3]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 