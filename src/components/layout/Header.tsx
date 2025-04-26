import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming path is correct

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4"> {/* Added px-4 here */}
        {/* Left side: Logo/Title */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Placeholder for Logo */}
            <span className="font-bold sm:inline-block">Principia AI</span>
          </Link>
          {/* Optional: Add main navigation links here if needed */}
        </div>

        {/* Right side: Sign In and Sign Up Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/signin/student">
            <Button variant="secondary" size="sm">Student Sign In</Button>
          </Link>
          <Link href="/signin/teacher">
            <Button variant="secondary" size="sm">Parent Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
