import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Heart, LogIn } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: favorites, isLoading } = trpc.manga.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-slate-950/95">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <Heart className="h-24 w-24 mx-auto text-slate-300 dark:text-slate-700" />
            <h2 className="text-2xl font-bold">يجب تسجيل الدخول</h2>
            <p className="text-slate-600 dark:text-slate-400">
              سجل الدخول لعرض قائمة المفضلة الخاصة بك
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>
                <LogIn className="h-4 w-4 mr-2" />
                تسجيل الدخول
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-slate-950/95">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">المفضلة</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {favorites?.length || 0} مانجا في قائمة المفضلة
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favorites.map((manga: any) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-xl font-semibold mb-2">لا توجد مانجا في المفضلة</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                ابدأ بإضافة المانجا المفضلة لديك
              </p>
              <Button onClick={() => setLocation("/")}>
                تصفح المانجا
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface MangaCardProps {
  manga: {
    id: number;
    title: string;
    titleAr?: string | null;
    coverImage?: string | null;
    rating: number | null;
    views: number | null;
  };
}

function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.id}`}>
      <a>
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
            {manga.coverImage ? (
              <img
                src={manga.coverImage}
                alt={manga.titleAr || manga.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-indigo-300 dark:text-indigo-700" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90">
                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                {manga.rating?.toFixed(1) || "N/A"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
              {manga.titleAr || manga.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {manga.views?.toLocaleString() || 0} مشاهدة
            </p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
