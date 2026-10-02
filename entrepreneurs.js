/* Entrepreneurs: one dataset, public CMS fields only (BRD 7.2). Private contact details, notes and
   admin fields are never held here. An entry appears on the site only when consent is true. */
window.ENTREPRENEURS = (() => {
  const A = f => 'ASSETS/' + encodeURI(f);
  const img = (base, ws, alt) => ({ src: A(base + '-' + ws[Math.min(1, ws.length - 1)] + '.webp'), srcset: ws.map(w => A(base + '-' + w + '.webp') + ' ' + w + 'w').join(', '), alt });
  /* value chain taxonomy (BRD 7.4) */
  const ACT = { stay: 'إقامة', food: 'طعام وشراب', crafts: 'إنتاج الحرف اليدوية', guiding: 'الإرشاد والتفسير', transport: 'النقل', tours: 'تنظيم الرحلات' };
  const list = [
    { slug: 'fatma-boghdady', city: 'luxor', act: 'crafts', p: 'crafts', consent: true,
      name: 'فاطمة البغدادي', biz: 'الحرفجية',
      sum: 'بعد تسع سنوات من البحث عن وظيفة، أسست فاطمة "الحرفجية" في الأقصر: ورشة تصنع حقائب ومنتجات جلدية بنقوش فرعونية وتُصدّرها إلى الخارج.',
      desc: 'بدأت فاطمة البغدادي رحلتها عام 2006 بعد تسع سنوات من البحث عن وظيفة ثابتة دون جدوى، فافتتحت محلًا صغيرًا لبيع خامات الحرف اليدوية. ومن هناك انتقلت إلى إصلاح الحلي والإكسسوارات، ثم إلى إعادة تدوير الخامات وتحويلها إلى قطع جديدة. وجمعت حولها فريقًا من الحرفيين المتخصصين في التطريز والجلود والمنتجات اليدوية التي تعكس ثقافة الأقصر، وأطلقت مؤخرًا خطًا للتصدير من الحقائب الجلدية بتصاميم فرعونية. عبر برنامج حلمك اكتسبت فاطمة معرفة واسعة في التصميم والتسويق وبناء خطط عمل متينة تضمن استدامة المشروع.',
      img: img('Fatma Boghdady', [480, 960, 1448], 'فاطمة البغدادي في ورشتها بالأقصر'), pos: '62% 35%',
      products: ['el-herfagya-leather'], contact: 'index.html#contact', helmak: true },
    { slug: 'zainab-gamal', city: 'luxor', act: 'crafts', p: 'products', consent: true,
      name: 'زينب جمال', biz: 'زينب للإكسسوارات',
      sum: 'من ورشة صغيرة في بيتها بالأقصر، تصمم زينب إكسسوارات وحليًا بتصاميم أصلية تعلّمتها بنفسها، وتحلم بمتجر خاص.',
      desc: 'في عام 2018 أنهت زينب جمال ورشة تدريبية عن أساسيات استخدام الأدوات، فأشعلت فيها شغف صناعة الإكسسوارات. علّمت نفسها بالتجربة والبحث على الإنترنت حتى طوّرت تصاميمها الخاصة من ورشة صغيرة في بيتها. ساعدها برنامج حلمك على التخطيط لمشروعها من الصفر: إعداد الميزانية، وتحديد المخاطر، وإدارة الموارد. وتطمح زينب إلى افتتاح متجر خاص والتوسّع خارج الأقصر.',
      img: img('Zainab Gamal', [480, 960, 1461], 'زينب جمال تعرض إكسسواراتها اليدوية'), pos: '25% 40%',
      products: ['zainab-accessories'], contact: 'index.html#contact', helmak: true },
    { slug: 'manal-awadallah', city: 'aswan', act: 'crafts', p: 'crafts', consent: true,
      name: 'منال عوض الله', biz: 'البيت النوبي',
      sum: 'تدير منال "البيت النوبي": مركز ثقافي يدرّب 50 سيدة على التطريز والجلود والطباعة ويحوّل الحرف النوبية إلى دخل.',
      desc: 'بدأت منال عوض الله عام 2014 بتعليم الخياطة للسيدات، ثم توسّعت إلى حرف متعددة حتى أسست "البيت النوبي"، مركزًا ثقافيًا يدرّب 50 سيدة على التطريز والجلود والطباعة بالشاشة الحريرية، بفريق أساسي من 15 سيدة وعاملات متناوبات. يقدّم المركز ورشًا للأطفال، ويحقق دخله من الإنتاج بالجملة وتأجير أماكن للبائعين وتجهيز ديكورات الأفراح. وعبر برنامج حلمك تعلّمت منال التخطيط الواقعي وإدارة مكان يجمع حرفًا متعددة تحت سقف واحد.',
      img: img('Manal Awaga', [480, 960, 1448], 'منال عوض الله في البيت النوبي'), pos: '62% 40%',
      products: ['el-beit-elnoby-textiles'], contact: 'index.html#contact', helmak: true },
    { slug: 'nubian-silver-workshop', city: 'aswan', act: 'crafts', p: 'crafts', consent: true, female: false,
      name: 'ورشة الفضة النوبية', biz: 'حرفيو أسوان',
      sum: 'ورشة تحافظ على حرفة الفضة النوبية وتفتح أبوابها للزوار.',
      desc: 'قابل الحرفيين المحليين في أسوان واصنع خاتمك الفضي الخاص باسمك بالخط النوبي، في ورشة تحافظ على حرفة الفضة النوبية وتفتح أبوابها للزوار.',
      img: img('asw-silver', [480, 960, 1280], 'حرفية نوبية تنقش الفضة في ورشتها بأسوان'),
      products: ['nubian-silver-workshop', 'nubian-silver-jewellery'], contact: 'index.html#contact' }
  ];
  const published = () => list.filter(e => e.consent);
  const bySlug = s => published().find(e => e.slug === s);
  const products = e => (window.EXPERIENCES ? EXPERIENCES.list : []).filter(x => (e.products || []).includes(x.slug));
  /* the workshop's coordinates come from its published product entry; nothing private is derived */
  const coords = e => e.ll || ((products(e).find(x => x.ll) || {}).ll);
  const href = e => 'entrepreneur.html?slug=' + e.slug;
  return { ACT, list, published, bySlug, products, coords, href };
})();
