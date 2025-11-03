# 🧠 دليل تشغيل موقع Smartgain.io خطوة بخطوة

## رفع إلى Vercel بسرعة
1. سجل دخول إلى vercel.com
2. اضغط New Project → Import Project → Upload ZIP
3. ارفع هذا الملف Smartgain.io_Vercel_ready.zip
4. قبل النشر: قم بإضافة Environment Variables (إن لم تكن مُضمنة):
   - OPENAI_API_KEY (يُدرج داخل الحزمة بالفعل)
   - LANGUAGES=ar,en,fr
   - DAILY_PER_LANGUAGE=3
   - GENERATE_SECRET=sgv_secret_12345
5. اضغط Deploy
6. بعد نشر المشروع: اذهب إلى Settings → Cron Jobs → Create Cron Job
   - Path: /api/generate?secret=sgv_secret_12345
   - Schedule: 0 2 * * *  (كل يوم 02:00 UTC أو اختَر Africa/Tunis)
   - Method: GET
7. اختبر الرابط: https://YOUR_PROJECT.vercel.app/api/generate?secret=sgv_secret_12345

## ملاحظة امنية
- المفتاح مُضمن داخل .env في الحزمة لمساعدتك على نشر سريع، لكن لا ترفع الحزمة لمستودع عام.
