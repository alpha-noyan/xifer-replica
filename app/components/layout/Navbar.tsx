
import Link from "next/link";
import { ImageIcon } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2">
            <ImageIcon size={20} />
          </div>

          <span className="text-xl font-bold">
            Sysinn's <span className="text-blue-500">Studio</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
          <Link href="#features" className="hover:text-white">
            Features
          </Link>

          <Link href="#how-it-works" className="hover:text-white">
            How it works
          </Link>

          <Link href="#upload" className="hover:text-white">
            Upload
          </Link>
        </div>

        <Link
          href="#upload"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
        >
          Get Started
        </Link>

      </nav>
    </header>
  );
}
