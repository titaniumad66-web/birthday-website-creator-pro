import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type TemplateItem = {
  id: string;
  title: string;
  imageUrl: string;
};

export default function AllTemplates() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) {
          setError("Templates are unavailable right now.");
          return;
        }
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      } catch {
        setError("Templates are unavailable right now.");
      }
    };
    loadTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
                Social Teaser Templates
              </h1>
              <p className="text-muted-foreground text-xl max-w-xl">
                Download ready-to-post Instagram story templates for birthdays.
              </p>
            </div>
          </div>

          {error ? (
            <div className="text-muted-foreground text-lg">{error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="group relative rounded-2xl overflow-hidden aspect-[9/16] shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={template.imageUrl}
                  alt={template.title || `Template ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center justify-end text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <a
                    href={template.imageUrl}
                    download
                    className="flex flex-col items-center text-white"
                  >
                    <Download className="w-8 h-8 text-white mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                    <span className="text-sm font-medium">Download</span>
                  </a>
                  <p className="text-white font-medium text-lg">
                    {(template.title || `Template ${index + 1}`).split("::")[0].trim()}
                  </p>
                  <div className="text-xs text-white/80">
                    {((template.title || "").split("::")[1] || "").trim()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
