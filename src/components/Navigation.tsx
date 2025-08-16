'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Menu, 
    X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

const NAV_ITEMS = [
];

export const Navigation: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav 
            className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-muted/20 px-4 md:px-8 py-4"
            aria-label="Main Navigation"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <Link 
                    href="/" 
                    className="text-2xl font-semibold font-playfair text-primary hover:text-primary/80 transition-colors"
                    aria-label="Voice to Slides Home"
                >
                    Voice to Slides
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="
                                font-inter text-muted 
                                hover:text-primary 
                                transition-colors 
                                font-medium
                                relative 
                                group
                            "
                        >
                            {item.label}
                            <span 
                                className="
                                    absolute 
                                    bottom-[-4px] 
                                    left-0 
                                    w-full 
                                    h-0.5 
                                    bg-secondary 
                                    scale-x-0 
                                    group-hover:scale-x-100 
                                    transition-transform 
                                    origin-left
                                "
                            />
                        </Link>
                    ))}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={toggleMobileMenu}
                                aria-label="Toggle Mobile Menu"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </DialogTrigger>
                        <DialogContent 
                            className="
                                fixed 
                                top-[72px] 
                                right-4 
                                left-4 
                                w-[calc(100%-2rem)] 
                                max-w-md 
                                mx-auto 
                                rounded-xl 
                                shadow-2xl 
                                bg-background/95 
                                backdrop-blur-lg
                            "
                        >
                            <DialogHeader>
                                <DialogTitle className="text-center text-primary font-playfair">
                                    Voice to Slides
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col space-y-4 py-4">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={toggleMobileMenu}
                                        className="
                                            w-full 
                                            text-center 
                                            py-3 
                                            font-inter 
                                            text-muted 
                                            hover:text-primary 
                                            hover:bg-primary/5 
                                            rounded-lg 
                                            transition-colors
                                        "
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;