import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t dark:border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Principia AI LLC. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/pricing" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Pricing
            </Link>
            {/* Add relevant links here, e.g., Privacy Policy, Terms of Service */}
            <Link href="/privacy-policy" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
