
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Save,
  Settings,
} from "lucide-react";

export default function EditorHeader() {
  return (
    <header className="border-b border-white/10 bg-[#11151e]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-lg font-bold">
              Xifer<span className="text-blue-500">Studio</span>
            </h1>
            <p className="text-xs text-gray-500">
              Image Metadata Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 opacity-50 sm:flex"
          >
            <Save size={16} />
            Save
          </button>

          <button
            disabled
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium opacity-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            aria-label="Settings"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Settings size={19} />
          </button>
        </div>

      </div>
    </header>
  );
}
