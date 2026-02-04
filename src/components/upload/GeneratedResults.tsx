import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '@/types/greeting';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedResultsProps {
  results: GeneratedImage[];
  isLoading: boolean;
}

export default function GeneratedResults({ results, isLoading }: GeneratedResultsProps) {
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDownload = async (imageUrl: string, index: number, templateId: string) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `greeting_${templateId}_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your greeting card has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 p-8 bg-card rounded-2xl border border-border/50 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium text-foreground">Generating your greeting cards...</p>
          <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Generated Cards</h3>
            <p className="text-sm text-muted-foreground">
              {results.length} card{results.length !== 1 ? 's' : ''} generated successfully
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div
              key={`${result.templateId}-${result.row}`}
              className="group relative bg-background rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-video relative overflow-hidden bg-muted/30">
                <img
                  src={result.image.url}
                  alt={`Generated greeting card ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    {result.image.width} × {result.image.height}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Row {result.row}
                  </span>
                </div>
                
                <Button
                  onClick={() => handleDownload(result.image.url, index, result.templateId)}
                  disabled={downloadingIndex === index}
                  className="w-full h-10 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {downloadingIndex === index ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}