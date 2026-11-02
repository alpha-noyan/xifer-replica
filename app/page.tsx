import Features from "./components/home/Features";
import Hero from "./components/home/Hero";
import HowItWorks from "./components/home/HowItWorks";
import UploadZone from "./components/home/UploadZone";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <UploadZone/>
      <Features/>
      <HowItWorks/>
      <Footer/>
    </main>
  );
}
