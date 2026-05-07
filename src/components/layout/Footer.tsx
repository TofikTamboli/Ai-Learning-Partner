import { Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-2 border-brand-black bg-white py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-brand-gray flex flex-col items-center gap-3">
        <p>Find free courses from Coursera, edX, MIT OpenCourseWare, YouTube, and more.</p>
        <p className="font-bold text-brand-black">Built With Love ❤️ By Tofik & Ibrahim</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span>Connect With Us:</span>
          <a
            href="https://www.linkedin.com/in/tofik-tamboli-91986a337/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-brand-black hover:text-brand-orange transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            Tofik Tamboli
          </a>
        </div>
      </div>
    </footer>
  );
}
