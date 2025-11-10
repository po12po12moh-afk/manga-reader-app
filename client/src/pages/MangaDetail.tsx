import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Eye, 
  Calendar,
  Play
} from "lucide-react";
import { toast } from "sonner";

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const mangaId = parseInt(id || "0");

  const { data: manga, isLoading } = trpc.manga.getById.useQuery({ id: mangaId });
  const addToFavorites = trpc.manga.addToFavorites.useMutation({
    onSuccess: () => {
      toast.success("تمت الإضافة إلى المفضلة");
    },
    onError: () => {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المانجا غير موجودة</h2>
          <Button onClick={() => setLocation("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    addToFavorites.mutate({ mangaId });
  };

  const handleStartReading = () => {
    if (manga.chapters && manga.chapters.length > 0) {
      setLocation(`/read/${manga.chapters[manga.chapters.length - 1].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
                {manga.coverImage ? (
                  <img
                    src={manga.coverImage}
                    alt={manga.titleAr || manga.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-indigo-300 dark:text-indigo-700" />
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleStartReading}
                disabled={!manga.chapters || manga.chapters.length === 0}
              >
                <Play className="h-5 w-5" />
                ابدأ القراءة
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleAddToFavorites}
                disabled={addToFavorites.isPending}
              >
                <Heart className="h-5 w-5" />
                إضافة للمفضلة
              </Button>
            </div>

            {/* Stats */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">التقييم</span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    <span className="font-semibold">{manga.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">المشاهدات</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold">{manga.views?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">الفصول</span>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">{manga.chapters?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{manga.titleAr || manga.title}</h1>
              {manga.titleAr && manga.title !== manga.titleAr && (
                <p className="text-lg text-slate-600 dark:text-slate-400">{manga.title}</p>
              )}
            </div>

            {/* Genres */}
            {manga.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.nameAr || genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">المؤلف</p>
                <p className="font-semibold">{manga.author || "غير معروف"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">الرسام</p>
                <p className="font-semibold">{manga.artist || "غير معروف"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">الحالة</p>
                <Badge variant={manga.status === "completed" ? "default" : "secondary"}>
                  {manga.status === "completed" ? "مكتملة" : manga.status === "ongoing" ? "مستمرة" : "متوقفة"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">النوع</p>
                <p className="font-semibold">
                  {manga.type === "manga" ? "مانجا" : manga.type === "manhwa" ? "مانهوا" : "مانهوا"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">القصة</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {manga.descriptionAr || manga.description || "لا يوجد وصف متاح."}
              </p>
            </div>

            {/* Chapters List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">قائمة الفصول</h2>
              {manga.chapters && manga.chapters.length > 0 ? (
                <div className="space-y-2">
                  {manga.chapters.map((chapter: any) => (
                    <Link key={chapter.id} href={`/read/${chapter.id}`}>
                      <a>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {chapter.titleAr || chapter.title || `الفصل ${chapter.chapterNumber}`}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Eye className="h-3 w-3" />
                                  <span>{chapter.views?.toLocaleString() || 0} مشاهدة</span>
                                </div>
                              </div>
                            </div>
                            <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-slate-600 dark:text-slate-400">
                    لا توجد فصول متاحة حالياً
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
