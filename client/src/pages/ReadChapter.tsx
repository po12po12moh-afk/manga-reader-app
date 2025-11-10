import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

export default function ReadChapter() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const chapterId = parseInt(id || "0");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: chapter, isLoading } = trpc.manga.getChapter.useQuery({ id: chapterId });
  const updateHistory = trpc.manga.updateReadingHistory.useMutation();

  useEffect(() => {
    if (chapter && isAuthenticated && user) {
      updateHistory.mutate({
        mangaId: chapter.mangaId,
        chapterId: chapter.id,
        pageNumber: currentPage,
      });
    }
  }, [currentPage, chapter, isAuthenticated, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, chapter]);

  const handleNextPage = () => {
    if (chapter && chapter.pages && currentPage < chapter.pages.length) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <Skeleton className="h-screen w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!chapter || !chapter.pages || chapter.pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الفصل غير موجود</h2>
          <Button onClick={() => setLocation("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const currentPageData = chapter.pages.find(p => p.pageNumber === currentPage);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-y-auto"
      onClick={() => setShowControls(!showControls)}
    >
      {/* Top Controls */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation(`/manga/${chapter.mangaId}`)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="font-semibold">
              {chapter.titleAr || chapter.title || `الفصل ${chapter.chapterNumber}`}
            </h2>
            <p className="text-sm text-slate-300">
              صفحة {currentPage} من {chapter.pages.length}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowChapterList(!showChapterList)}
            className="text-white hover:bg-white/20"
          >
            {showChapterList ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen py-20">
        <div className="relative w-full max-w-4xl">
          {currentPageData && (
            <img
              src={currentPageData.imageUrl}
              alt={`صفحة ${currentPage}`}
              className="w-full h-auto"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="container mx-auto px-4 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(currentPage / chapter.pages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronRight className="h-5 w-5" />
              السابق
            </Button>

            <div className="flex-1 text-center">
              <input
                type="range"
                min="1"
                max={chapter.pages.length}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <Button
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPage === chapter.pages.length}
              className="gap-2"
            >
              التالي
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Page Navigation Overlay */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="grid grid-cols-2 h-full">
          <button
            className="pointer-events-auto cursor-w-resize"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPage();
            }}
          />
          <button
            className="pointer-events-auto cursor-e-resize"
            onClick={(e) => {
              e.stopPropagation();
              handleNextPage();
            }}
          />
        </div>
      </div>
    </div>
  );
}
