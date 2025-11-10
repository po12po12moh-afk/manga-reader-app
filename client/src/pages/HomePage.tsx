import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, TrendingUp, Clock, Heart } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch manga data
  const { data: popularManga, isLoading: loadingPopular } = trpc.manga.getPopular.useQuery({ limit: 6 });
  const { data: recentManga, isLoading: loadingRecent } = trpc.manga.getRecent.useQuery({ limit: 6 });
  const { data: genres } = trpc.manga.getGenres.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  مانجا ريدر
                </span>
              </a>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/"><a className="text-sm font-medium hover:text-indigo-600 transition-colors">الرئيسية</a></Link>
              <Link href="/library"><a className="text-sm font-medium hover:text-indigo-600 transition-colors">المكتبة</a></Link>
              <Link href="/favorites"><a className="text-sm font-medium hover:text-indigo-600 transition-colors">المفضلة</a></Link>
              <Link href="/profile"><a className="text-sm font-medium hover:text-indigo-600 transition-colors">الملف الشخصي</a></Link>
            </nav>

            <Button variant="default" asChild>
              <Link href="/login">
                <a>تسجيل الدخول</a>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              اكتشف عالم المانجا والمانهوا
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              آلاف القصص المصورة المترجمة للعربية في مكان واحد
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="ابحث عن المانجا المفضلة لديك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 py-6 text-lg rounded-full border-2 border-indigo-200 focus:border-indigo-500 dark:border-slate-700"
              />
            </div>

            {/* Genre Tags */}
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {genres.slice(0, 8).map((genre: any) => (
                  <Badge key={genre.id} variant="secondary" className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900">
                    {genre.nameAr || genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              الأكثر شعبية
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الأحدث
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            {loadingPopular ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularManga?.map((manga: any) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {loadingRecent ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentManga?.map((manga: any) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-950 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>© 2025 مانجا ريدر. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
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
                <Heart className="h-3 w-3 mr-1" />
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
