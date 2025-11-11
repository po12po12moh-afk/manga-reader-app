import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * صفحة إعداد Firebase Cloud Messaging
 * 
 * تسمح للمشرف بإضافة Service Account JSON من Firebase
 * لتفعيل نظام الإشعارات Push
 */
export default function FirebaseSetup() {
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);

  // التحقق من صحة JSON
  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValidJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // التحقق من وجود الحقول المطلوبة
      const requiredFields = [
        "type",
        "project_id",
        "private_key_id",
        "private_key",
        "client_email",
        "client_id",
      ];

      const hasAllFields = requiredFields.every((field) => field in parsed);
      setIsValidJson(hasAllFields && parsed.type === "service_account");
    } catch {
      setIsValidJson(false);
    }
  };

  const handleJsonChange = (value: string) => {
    setServiceAccountJson(value);
    validateJson(value);
  };

  const handleSave = async () => {
    if (!isValidJson) {
      toast.error("الرجاء إدخال Service Account JSON صحيح");
      return;
    }

    try {
      // هنا يمكن إضافة API endpoint لحفظ الـ credentials
      // لكن لأسباب أمنية، يُفضل إضافتها كـ environment variable يدوياً
      
      toast.success("تم التحقق من صحة JSON! الرجاء إضافته كـ environment variable: FIREBASE_SERVICE_ACCOUNT");
      
      // نسخ JSON إلى الحافظة
      await navigator.clipboard.writeText(serviceAccountJson);
      toast.info("تم نسخ JSON إلى الحافظة");
    } catch (error) {
      toast.error("حدث خطأ أثناء المعالجة");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleJsonChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إعداد Firebase Cloud Messaging</CardTitle>
            <CardDescription>
              قم بإضافة Service Account JSON من Firebase لتفعيل نظام الإشعارات Push
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* التعليمات */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">خطوات الحصول على Service Account JSON:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>اذهب إلى <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                    <li>اختر مشروعك أو أنشئ مشروع جديد</li>
                    <li>اذهب إلى Project Settings → Service Accounts</li>
                    <li>اضغط "Generate new private key"</li>
                    <li>حمّل ملف JSON وارفعه هنا</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            {/* رفع ملف */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">رفع ملف JSON</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  اختر ملف JSON
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* إدخال JSON يدوياً */}
            <div className="space-y-2">
              <Label htmlFor="service-account-json">
                أو الصق محتوى JSON هنا
              </Label>
              <Textarea
                id="service-account-json"
                value={serviceAccountJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{\n  "type": "service_account",\n  "project_id": "your-project-id",\n  ...\n}'
                className="font-mono text-sm min-h-[300px]"
                dir="ltr"
              />
            </div>

            {/* حالة التحقق */}
            {isValidJson !== null && (
              <Alert variant={isValidJson ? "default" : "destructive"}>
                {isValidJson ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      ✅ JSON صحيح! يمكنك الآن حفظه.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ❌ JSON غير صحيح. تأكد من أنه Service Account JSON من Firebase.
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}

            {/* أزرار الحفظ */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!isValidJson}
                className="flex-1"
              >
                التحقق ونسخ JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setServiceAccountJson("");
                  setIsValidJson(null);
                }}
              >
                مسح
              </Button>
            </div>

            {/* تعليمات إضافية */}
            <Alert>
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">⚠️ ملاحظة أمنية:</p>
                <p>
                  لأسباب أمنية، يجب إضافة Service Account JSON كـ environment variable
                  بدلاً من حفظه في قاعدة البيانات. بعد التحقق من صحة JSON، أضفه إلى
                  إعدادات المشروع كـ <code className="bg-gray-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT</code>
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
