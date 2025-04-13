# مجموعة امتدادات Open WebUI Docker

![شعار Yo AI Lab](yo-ai-lab.png)

[![بناء](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml/badge.svg?branch=main&event=release)](https://github.com/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui/actions/workflows/build.yaml)

امتداد Docker Desktop ينشر مجموعة من الأدوات تتمحور حول [Open WebUI](https://docs.openwebui.com/)، مُكوَّن لتسريع NVIDIA GPU (إذا كان متاحًا) وخدمات تكميلية متنوعة، كلها يمكن الوصول إليها عبر واجهة موحدة.

![لقطة شاشة للامتداد](screenshot.png)

## الميزات الرئيسية

*   **واجهة موحدة**: شريط تنقل يسمح بالتبديل بسهولة بين واجهات الويب للخدمات المختلفة المضمنة (Open WebUI، Jupyter، MinIO Console، إلخ) دون مغادرة الامتداد.
*   **Open WebUI مهيأ مسبقًا**: واجهة ويب للتفاعل مع نماذج اللغة المحلية (عبر Ollama) أو عن بُعد (OpenAI API، OpenRouter). تم تمكين تسريع NVIDIA GPU افتراضيًا (`ghcr.io/open-webui/open-webui:dev-cuda`).
*   **فحص GPU المتكامل**: يكتشف وجود أدوات NVIDIA (`nvidia-smi`) ويوجه المستخدم إذا لم يتم استيفاء المتطلبات المسبقة (فقط للعرض الأولي، تظل الواجهة الرئيسية متاحة).
*   **مجموعة الخدمات**: تتضمن العديد من الخدمات المفيدة للذكاء الاصطناعي والتطوير.
*   **بيانات الاعتماد السريعة**: يعرض زر في شريط التنقل بيانات الاعتماد الافتراضية للخدمات (Jupyter، MinIO) في نافذة مشروطة.

## الخدمات المضمنة

ينشر هذا الامتداد الخدمات التالية (يمكن الوصول إليها عبر `http://host.docker.internal:<PORT>` من Open WebUI أو حاويات أخرى على نفس شبكة Docker):

*   **Open WebUI** (`:11500`): الواجهة الرئيسية للتفاعل مع LLMs.
*   **Ollama** (`:11434`): مشغل لنماذج اللغة المحلية. *التكامل: مهيأ تلقائيًا (`OLLAMA_BASE_URL`)*.
*   **LibreTranslate** (`:11553`): خادم ترجمة تلقائي مفتوح المصدر. *التكامل: غير مدمج افتراضيًا مع Open WebUI.*
*   **SearxNG** (`:11505`): محرك بحث تعريفي يحترم الخصوصية. *التكامل: مهيأ كمحرك بحث ويب افتراضي لـ RAG (`SEARXNG_QUERY_URL`)*.
*   **Docling Serve** (`:11551`): خادم OCR (التعرف البصري على الأحرف). *التكامل: غير مدمج افتراضيًا مع Open WebUI.*
*   **OpenAI Edge TTS** (`:11550`): خادم تحويل النص إلى كلام يستخدم خدمة Microsoft Edge. *التكامل: غير مدمج افتراضيًا مع Open WebUI.*
*   **Jupyter Notebook** (`:11552`): بيئة تطوير تفاعلية. *التكامل: لا يوجد مباشر. يمكن الوصول إليه عبر المنفذ الخاص به.*
*   **MinIO** (`:11556` وحدة التحكم, `:11557` نقطة نهاية S3): تخزين كائن متوافق مع S3. *التكامل: يمكن تهيئته كموفر تخزين في Open WebUI (المتغيرات `STORAGE_PROVIDER`, `S3_*`).*
*   **Redis** (`:11558`): قاعدة بيانات مفتاح-قيمة في الذاكرة. *التكامل: يمكن استخدامه لإدارة WebSocket (`WEBSOCKET_MANAGER`, `WEBSOCKET_REDIS_URL`) والتخزين المؤقت (غير مهيأ افتراضيًا).*
*   **Apache Tika** (`:11560`): مجموعة أدوات استخراج المحتوى. *التكامل: مهيأ لاستخراج نص RAG (`TIKA_SERVER_URL`)*.
*   **MCP Tools** (المنافذ `11561` إلى `11570`): مجموعة أدوات لإطار عمل MCP (Multi-agent Conversation Protocol) بما في ذلك `filesystem`, `memory`, `time`, `fetch`, `everything`, `sequentialthinking`, `sqlite`, `redis`. *التكامل: لا يوجد. لا يمكن الوصول إليها عبر شريط التنقل.*
*   **خدمة MCP_DOCKER** (عبر Extension SDK): خدمة مقدمة من Docker Inc. تمنح الوصول إلى أدوات الذكاء الاصطناعي المختلفة عبر خادم MCP المهيأ بواسطة امتداد "AI Tool Catalog". *التكامل: يتم التعامل مع الاتصال بواسطة Docker Desktop extension SDK.*

## واجهة مستخدم الامتداد

تتكون الواجهة الرئيسية للامتداد من:

1.  **شريط التنقل العلوي**:
    *   يعرض الاسم "Services:".
    *   يحتوي على أزرار لكل خدمة بواجهة ويب (Open WebUI، LibreTranslate، SearxNG، Docling Serve، Jupyter، MinIO Console). يتم تمييز زر الخدمة النشطة.
    *   زر معلومات (`i`) على اليمين يفتح نافذة مشروطة تعرض بيانات الاعتماد الافتراضية لـ Jupyter و MinIO.
2.  **الإطار الرئيسي (Iframe)**:
    *   يعرض واجهة الويب للخدمة المحددة عبر شريط التنقل.

## تكوين Open WebUI

تم تكوين Open WebUI مسبقًا عبر متغيرات البيئة في `docker-compose.yaml` لاستخدام بعض الخدمات المضمنة:

*   **Ollama** (`OLLAMA_BASE_URL=http://host.docker.internal:11434`)
*   **SearxNG لـ RAG** (`SEARXNG_QUERY_URL=http://host.docker.internal:11505`)
*   **Apache Tika لـ RAG** (`TIKA_SERVER_URL=http://host.docker.internal:11560`)
*   **OpenRouter API (عبر نقطة نهاية OpenAI)**: يتطلب مفتاح API (`OPENROUTER_API_KEY`) في ملف `.env` في جذر المشروع.

يمكنك تخصيص التكوين بشكل أكبر عن طريق تعديل متغيرات البيئة في `docker-compose.yaml` وإعادة تشغيل الامتداد. استشر [وثائق Open WebUI](https://docs.openwebui.com/) لجميع الخيارات المتاحة.

## المتطلبات المسبقة (تسريع NVIDIA GPU)

للاستفادة من تسريع GPU باستخدام بطاقات NVIDIA، **يجب** عليك تنفيذ الخطوات التالية **قبل** استخدام الامتداد:

1.  **تثبيت برامج تشغيل NVIDIA**: قم بتنزيل وتثبيت أحدث برامج تشغيل NVIDIA لنظام التشغيل وبطاقة الرسومات الخاصة بك من [موقع NVIDIA الرسمي](https://www.nvidia.com/Download/index.aspx).
2.  **تمكين دعم GPU في Docker Desktop**: انتقل إلى `Settings` > `Resources` > `Advanced` وقم بتمكين خيار `Enable GPU acceleration` (أو ما شابه، قد يختلف الاسم الدقيق).
3.  **إعادة تشغيل Docker Desktop**: بعد تثبيت برامج التشغيل وتغيير الإعدادات، أعد تشغيل Docker Desktop.

سيتحقق الامتداد تلقائيًا مما إذا كانت أداة `nvidia-smi` قابلة للاكتشاف. إذا لم يكن الأمر كذلك، فسيعرض إرشادات لتوجيهك.

*(ملاحظة: دعم GPU القياسي لـ Docker Desktop لـ NVIDIA غير متاح على macOS.)*

## كيف يعمل

سيقوم الامتداد بـ:

1.  بدء الخدمات المحددة في `docker-compose.yaml`.
2.  التحقق من وجود أدوات NVIDIA على نظام المضيف الخاص بك عبر ملف ثنائي صغير.
3.  إذا تم اكتشاف الأدوات (`nvidia-smi`)، فسيتم عرض واجهة Open WebUI (والخدمات الأخرى المهيأة) ويمكنها استخدام GPU.
4.  إذا لم يتم اكتشاف الأدوات أو إذا كان نظام التشغيل غير مدعوم (macOS)، فسيتم عرض دليل **مبدئيًا** مع إرشادات المتطلبات المسبقة قبل تحميل الواجهة الرئيسية.

## كيفية التثبيت

- قم بتثبيت وتشغيل [Docker Desktop](https://www.docker.com/products/docker-desktop/) (أو Docker Desktop، إذا كان متوافقًا).
- تأكد من استيفاء متطلبات GPU المسبقة (انظر أعلاه) إذا كنت تريد تسريع الأجهزة.
- قم بتشغيل الأمر:

  ```sh
  docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  # مثال: docker extension install ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest
  ```

## كيفية إلغاء التثبيت

- قم بتشغيل الأمر:

  ```sh
  docker extension uninstall ghcr.io/mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:<tag>
  ```

## كيفية بناء صورة الامتداد

- قم بتشغيل الأمر:

  ```sh
  docker build -t <your-extension-image-name>:<tag> .
  # مثال: docker build -t mairie-de-saint-jean-cap-ferrat/docker-desktop-open-webui:latest .
  ```

*(يمكن أيضًا استخدام أوامر `rdctl` إذا كنت تستخدم Rancher Desktop)*

## كيفية الإصدار

```sh
gh release create vX.Y.Z --generate-notes
``` 