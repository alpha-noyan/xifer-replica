
import {
  MapPin,
  Camera,
  FileSearch,
  ShieldCheck,
  Layers,
  Download,
  CalendarClock,
  ImagePlus,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "GPS Geotagging",
    description:
      "Add geographical coordinates to your photos using an interactive map.",
  },
  {
    icon: FileSearch,
    title: "Metadata Viewer",
    description:
      "Explore EXIF, IPTC and XMP metadata embedded in your images.",
  },
  {
    icon: Camera,
    title: "EXIF Editor",
    description:
      "Modify camera information, image descriptions and other metadata.",
  },
  {
    icon: ShieldCheck,
    title: "Metadata Cleaner",
    description:
      "Remove unwanted metadata and protect sensitive image information.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description:
      "Process multiple images together and save time.",
  },
  {
    icon: Download,
    title: "Export Images",
    description:
      "Download your updated images with their modified metadata.",
  },
  {
    icon: CalendarClock,
    title: "Date & Time Editor",
    description:
      "Manage image capture dates and timestamps.",
  },
  {
    icon: ImagePlus,
    title: "Multiple Formats",
    description:
      "Work with supported image formats in one workspace.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-white/10 bg-[#10131a] px-6 py-24">

      <div className="mx-auto max-w-7xl">

        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Powerful Features
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            Everything You Need to Manage Image Metadata
          </h2>

          <p className="mt-4 text-gray-400">
            A complete workspace for viewing, editing and organizing
            your image metadata.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-[#141821] p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
              >
                <div className="mb-5 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                  <Icon size={24} />
                </div>

                <h3 className="text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
