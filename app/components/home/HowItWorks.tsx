
import {
  Upload,
  MapPinned,
  Download,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Images",
    description:
      "Select one or multiple images from your device.",
  },
  {
    number: "02",
    icon: MapPinned,
    title: "Edit Metadata",
    description:
      "Inspect image metadata and add GPS coordinates using our map.",
  },
  {
    number: "03",
    icon: Download,
    title: "Download Results",
    description:
      "Save your updated images with the new metadata.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Simple Workflow
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            How It Works
          </h2>

          <p className="mt-4 text-gray-400">
            Manage your image metadata in three simple steps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/10 bg-[#141821] p-8 text-center"
              >
                <span className="absolute right-6 top-5 text-4xl font-bold text-white/5">
                  {step.number}
                </span>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Icon size={30} />
                </div>

                <h3 className="text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {step.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
