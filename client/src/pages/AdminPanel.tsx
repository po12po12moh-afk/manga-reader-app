import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download, 
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeSource, setScrapeSource] = useState("example");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  
  // Olympustaff import states
  const [olympusSlug, setOlympusSlug] = useState("");
  const [maxChapters, setMaxChapters] = useState<number>(5);
  const importMutation = trpc.scraper.importFromOlympus.useMutation();

  const scrapeManga = trpc.scraper.scrapeMangaDetails.useMutation({
    onSuccess: (data) => {
      setScrapeResult(data);
      toast.success("تم سحب المانجا بنجاح!");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء سحب المانجا");
      setIsLoading(false);
    },
  });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">غير مصرح</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              هذه الصفحة متاحة للمشرفين فقط
            </p>
            <Button onClick={() => setLocation("/")}>
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleScrape = async () => {
    if (!scrapeUrl) {
      toast.error("يرجى إدخال رابط المانجا");
      return;
    }

    setIsLoading(true);
    setScrapeResult(null);
    
    scrapeManga.mutate({
      source: scrapeSource,
      mangaUrl: scrapeUrl,
      includeChapters: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-slate-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold">لوحة التحكم</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="scraper" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="scraper">سحب المحتوى</TabsTrigger>
            <TabsTrigger value="manual">إضافة يدوية</TabsTrigger>
          </TabsList>

          <TabsContent value="scraper">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  سحب المانجا من المواقع الخارجية
                </CardTitle>
                <CardDescription>
                  أدخل رابط المانجا لسحب المحتوى تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ملاحظة هامة:</strong> نظام Web Scraping يحتاج تخصيص حسب كل موقع.
                    الكود الحالي هو قالب عام يجب تعديله ليتناسب مع بنية الموقع المستهدف.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source">المصدر</Label>
                    <Input
                      id="source"
                      value={scrapeSource}
                      onChange={(e) => setScrapeSource(e.target.value)}
                      placeholder="example"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      المصدر المحدد في server/scraper/mangaScraper.ts
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="url">رابط المانجا</Label>
                    <Input
                      id="url"
                      type="url"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      placeholder="https://example.com/manga/solo-leveling"
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    onClick={handleScrape} 
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        جاري السحب...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        سحب المانجا
                      </>
                    )}
                  </Button>
                </div>

                {scrapeResult && (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>تم بنجاح!</strong>
                      <br />
                      تم إضافة "{scrapeResult.title}" مع {scrapeResult.chaptersCount} فصل
                      <br />
                      <Button
                        variant="link"
                        className="p-0 h-auto text-green-600 dark:text-green-400"
                        onClick={() => setLocation(`/manga/${scrapeResult.mangaId}`)}
                      >
                        عرض المانجا
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Documentation Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>كيفية تخصيص Scraper</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>لتخصيص نظام السحب لموقع معين:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>افتح ملف <code>server/scraper/mangaScraper.ts</code></li>
                  <li>أضف الموقع المستهدف في دالة <code>createScraper</code></li>
                  <li>عدّل selectors في دوال <code>scrapeMangaList</code> و <code>scrapeMangaDetails</code></li>
                  <li>اختبر السحب باستخدام هذه الواجهة</li>
                </ol>
                
                <p className="mt-4">
                  <strong>مثال:</strong> لسحب من موقع معين، افحص HTML باستخدام DevTools
                  وحدد الـ CSS selectors المناسبة لكل عنصر.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>إضافة مانجا يدوياً</CardTitle>
                <CardDescription>
                  يمكنك إضافة المانجا يدوياً من خلال قاعدة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    استخدم واجهة قاعدة البيانات في لوحة الإدارة لإضافة المانجا والفصول يدوياً.
                    يمكنك الوصول إليها من القائمة الجانبية.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
