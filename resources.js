/* Resources, learning paths and entrepreneur events. Fields follow the BRD Resource, Learning Path and Event models.
   Sample entries for the prototype; CIDEAL replaces them from the CMS. Documents live in ASSETS/resources/. */
window.RESOURCES = (() => {
  const A = f => 'ASSETS/' + encodeURI(f);
  const img = (base, ws, alt) => ({ src: A(base + '-' + ws[Math.min(1, ws.length - 1)] + '.webp'), srcset: ws.map(w => A(base + '-' + w + '.webp') + ' ' + w + 'w').join(', '), alt });
  const FMT = { document: 'مستند', link: 'رابط', video: 'فيديو', webinar: 'تسجيل ويبينار' };
  const TOPIC = { start: 'بدء المشروع', finance: 'التمويل والميزانية', marketing: 'التسويق', product: 'تطوير المنتج', leadership: 'القيادة', tourism: 'السياحة المستدامة' };
  const list = [
    { slug: 'business-plan-template', fmt: 'document', topic: 'start', p: 'products', n: 'نموذج خطة العمل', s: 'قالب جاهز لكتابة خطة مشروعك خطوة بخطوة، من الفكرة إلى الأرقام.', href: 'ASSETS/resources/business-plan-template.pdf', pages: 12 },
    { slug: 'registration-guide', fmt: 'document', topic: 'start', p: 'products', n: 'دليل تسجيل المشروع الصغير', s: 'الخطوات والمستندات المطلوبة لتسجيل مشروع صغير في الأقصر أو أسوان.', href: 'ASSETS/resources/registration-guide.pdf', pages: 8 },
    { slug: 'budget-sheet', fmt: 'document', topic: 'finance', p: 'products', n: 'ورقة الميزانية الأولى', s: 'جدول بسيط لحساب التكاليف والسعر وهامش الربح لأول منتج.', href: 'ASSETS/resources/budget-sheet.pdf', pages: 4 },
    { slug: 'pricing-handicrafts', fmt: 'video', topic: 'finance', p: 'crafts', n: 'كيف تسعّر منتجك اليدوي؟', s: 'شرح مصوّر لحساب تكلفة القطعة اليدوية وتحديد سعر عادل لها.', video: { src: 'ASSETS/video/luxor-karnak.mp4', poster: 'ASSETS/video/luxor-habu-poster.jpg' }, dur: '12 دقيقة' },
    { slug: 'social-media-basics', fmt: 'webinar', topic: 'marketing', p: 'products', n: 'التسويق عبر وسائل التواصل', s: 'تسجيل ويبينار عن عرض المنتجات والتجارب للزوار على إنستجرام وفيسبوك.', video: { src: 'ASSETS/video/luxor-habu.mp4', poster: 'ASSETS/video/luxor-habu-poster.jpg' }, dur: '48 دقيقة' },
    { slug: 'helmak-stories', fmt: 'link', topic: 'leadership', p: 'crafts', n: 'رائدات أعمال يغيّرن مصر: قصص حلمك', s: 'مقال CIDEAL عن المستفيدات من برنامج حلمك وما تعلّمنه.', href: 'https://www.cideal.org/las-mujeres-emprendedoras-estan-transformando-egipto-conoce-a-las-beneficiarias-de-nuestro-programa-helmak/' },
    { slug: 'female-leadership-guide', fmt: 'document', topic: 'leadership', p: 'crafts', n: 'دليل القيادة النسائية في المشروعات الصغيرة', s: 'أدوات عملية لإدارة فريق من السيدات وتوزيع الأدوار والتفاوض.', href: 'ASSETS/resources/female-leadership-guide.pdf', pages: 16 },
    { slug: 'youth-toolkit', fmt: 'document', topic: 'start', p: 'gems', n: 'حقيبة أدوات الشباب لريادة الأعمال', s: 'تمارين قصيرة لاختبار فكرتك وفهم عميلك قبل أن تبدأ.', href: 'ASSETS/resources/youth-toolkit.pdf', pages: 20 },
    { slug: 'visitor-experience-design', fmt: 'video', topic: 'tourism', p: 'culture', n: 'تصميم تجربة للزائر', s: 'كيف تحوّل حرفة أو مكانًا إلى تجربة يحجزها الزائر ويتذكرها.', video: { src: 'ASSETS/video/luxor-karnak.mp4', poster: 'ASSETS/video/luxor-habu-poster.jpg' }, dur: '18 دقيقة' },
    { slug: 'sustainable-tourism-principles', fmt: 'link', topic: 'tourism', p: 'culture', n: 'مبادئ السياحة المستدامة', s: 'المرجع الدولي لمبادئ السياحة المستدامة من منظمة السياحة العالمية.', href: 'https://www.unwto.org/sustainable-development' },
  ];
  const paths = [
    { slug: 'how-to-start-a-business', aud: 'entrepreneurs', n: 'كيف تبدأ مشروعك', s: 'من الفكرة إلى التسجيل وأول ميزانية.', p: 'products', img: img('Fatma Boghdady', [480, 960, 1448], 'فاطمة البغدادي في ورشتها بالأقصر'), pos: '62% 35%', steps: ['youth-toolkit', 'business-plan-template', 'registration-guide', 'budget-sheet'] },
    { slug: 'young-entrepreneurship-toolkit', aud: 'entrepreneurs', n: 'حقيبة أدوات ريادة الأعمال للشباب', s: 'اختبر فكرتك، سعّر منتجك، وسوّقه.', p: 'gems', img: img('Zainab Gamal', [480, 960, 1461], 'زينب جمال تعرض إكسسواراتها اليدوية'), pos: '25% 40%', steps: ['youth-toolkit', 'pricing-handicrafts', 'social-media-basics', 'visitor-experience-design'] },
    { slug: 'female-leadership', aud: 'both', n: 'القيادة النسائية', s: 'قيادة فريق ومشروع يخلق فرصًا للسيدات.', p: 'crafts', img: img('Manal Awaga', [480, 960, 1448], 'منال عوض الله في البيت النوبي'), pos: '62% 40%', steps: ['helmak-stories', 'female-leadership-guide', 'social-media-basics'] },
  ];
  /* entrepreneur events: trainings, forums and gatherings (BRD 2.1). Dates are ISO so they sort and localise. */
  const events = [
    { slug: 'helmak-cohort-3-open-day', n: 'يوم مفتوح: الدفعة الثالثة من برنامج حلمك', s: 'تعرّف على مسار الحضانة وشروط التقديم والتقِ بخريجي الدفعات السابقة.', date: '2026-10-22', time: '11:00 صباحًا', loc: 'الأقصر', kind: 'لقاء', reg: 'index.html#contact' },
    { slug: 'pricing-workshop-aswan', n: 'ورشة تسعير المنتجات اليدوية', s: 'ورشة عملية ليوم واحد مع حرفيي أسوان عن التكلفة والسعر وهامش الربح.', date: '2026-11-05', time: '10:00 صباحًا', loc: 'أسوان', kind: 'تدريب', reg: 'index.html#contact' },
    { slug: 'upper-egypt-tourism-forum', n: 'منتدى السياحة المستدامة في صعيد مصر', s: 'رواد أعمال وجهات سياحية وشركاء في يوم للتشبيك وعرض التجارب.', date: '2026-11-26', time: '9:30 صباحًا', loc: 'الأقصر', kind: 'منتدى', reg: 'index.html#contact' },
  ];
  const bySlug = s => list.find(r => r.slug === s);
  const pathBySlug = s => paths.find(p => p.slug === s);
  const pathSteps = p => p.steps.map(bySlug).filter(Boolean);
  const upcoming = () => events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));
  return { FMT, TOPIC, list, paths, events, bySlug, pathBySlug, pathSteps, upcoming, pathHref: p => 'learning-path.html?slug=' + p.slug };
})();
