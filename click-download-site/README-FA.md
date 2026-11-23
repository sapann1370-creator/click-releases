# وب‌سایت دانلود حسابداری کلیک

وب‌سایت فارسی RTL برای معرفی نرم‌افزار حسابداری کافی‌نت کلیک، نمایش آخرین نسخه، آرشیو نسخه‌ها و پنل خصوصی انتشار.

## امکانات
- صفحه معرفی نرم‌افزار و نمایش نسخه‌ها
- پنل مدیریت در مسیر `/admin/`
- انتشار فایل نصب ویندوز `.exe` در GitHub Releases
- ساخت خودکار `latest.json` شامل شماره نسخه، لینک دانلود و SHA-256
- API سازگار با بررسی نسخه جدید داخل برنامه: `/api/latest`
- بدون نیاز به Cloudflare R2 یا کارت بانکی

## استقرار
1. محتویات این پوشه را در مخزن خصوصی `click-download-site` قرار دهید.
2. در Cloudflare Workers & Pages یک Pages project از مخزن GitHub بسازید.
3. Build output directory را `public` قرار دهید. Build command خالی باشد.
4. در Settings → Variables and Secrets برای Production این دو مقدار را اضافه کنید:
   - Secret `ADMIN_PASSWORD`: یک رمز قوی و محرمانه برای پنل
   - Secret `GITHUB_TOKEN`: یک Fine-grained personal access token برای مخزن `sapann1370-creator/click-releases` با دسترسی **Contents: Read and write** و Metadata: Read-only
5. پروژه را Deploy کنید.

## ساخت توکن GitHub
در GitHub به Settings → Developer settings → Personal access tokens → Fine-grained tokens بروید. فقط مخزن `click-releases` را انتخاب کنید و دسترسی Contents را Read and write قرار دهید. توکن را فقط در Cloudflare به عنوان Secret با نام `GITHUB_TOKEN` ذخیره کنید؛ آن را در سایت یا چت قرار ندهید.

## انتشار نسخه
به `https://دامنه-سایت/admin/` بروید و با `ADMIN_PASSWORD` وارد شوید. شماره نسخه، تاریخ، توضیحات و فایل EXE (حداکثر ۹۰ مگابایت) را ثبت و منتشر کنید. سیستم یک GitHub Release با تگ `vX.Y.Z` می‌سازد، فایل را بارگذاری می‌کند و `latest.json` را به‌روزرسانی می‌کند.

## API
- آخرین نسخه: `/api/latest`
- آرشیو نسخه‌ها: `/api/releases`
- دانلود آخرین نسخه: `/api/download/latest`
- دانلود نسخه مشخص: `/api/download/2.5.5`

## نکات امنیتی و محدودیت
- مخزن انتشار عمومی است؛ فایل نصب، شماره نسخه و توضیحات انتشار برای همه قابل مشاهده و دانلود است.
- توکن GitHub و رمز پنل باید فقط به صورت Secret در Cloudflare ذخیره شوند.
- حجم آپلود پنل در این نسخه به ۹۰ مگابایت محدود است.
- نسخه‌های قدیمی برنامه فقط وقتی اعلان می‌گیرند که URL بررسی نسخه در آن‌ها از قبل تنظیم شده باشد.
