
import {
  MapPin,
  Camera,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="px-6 pb-16 pt-24 text-center">

      <div className="mx-auto max-w-4xl">

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          <MapPin size={16} />
          Professional Image Geotagging
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Manage Your Image Metadata.
          <span className="block text-blue-500">
            Tag Your World.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          View, edit and manage image metadata.
          Add GPS coordinates to your photographs
          and organize your digital memories.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Camera size={17} className="text-blue-400" />
            EXIF Editor
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={17} className="text-blue-400" />
            GPS Geotagging
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-blue-400" />
            Metadata Control
          </div>
        </div>

      </div>

    </section>
  );
}
