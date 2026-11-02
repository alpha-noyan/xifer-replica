import Link from "next/link";
import { ImageIcon, Github, ArrowUpRight } from "lucide-react";

export default async function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#10131a] px-6 py-12">

      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-3">

          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-2">
                <ImageIcon size={20} />
              </div>

              <span className="text-xl font-bold">
                Xifer<span className="text-blue-500">Studio</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">
              A workspace for viewing, editing and managing
              image metadata and GPS information.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Navigation</h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="#features" className="hover:text-white">Features</Link>
              <Link href="#how-it-works" className="hover:text-white">How it works</Link>
              <Link href="#upload" className="hover:text-white">Upload Images</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Tools</h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <span>EXIF Metadata Editor</span>
              <span>GPS Geotagging</span>
              <span>Metadata Viewer</span>
              <span>Image Metadata Cleaner</span>
            </div>
          </div>

        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 Sysinn. All rights reserved.</p>

          <p>Built for managing digital image metadata.</p>
        </div>

      </div>

    </footer>
  );
}
