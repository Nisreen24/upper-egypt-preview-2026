/* Destinations: places a visitor goes to. Fields follow the BRD Destination model:
   name, city, category, pillar, summary, description, gallery, coordinates, related experiences and entrepreneurs.
   No duration, price band or booking route: those belong to experiences. */
window.DESTINATIONS = (() => {
  const A = f => 'ASSETS/' + encodeURI(f);
  const img = (base, ws, alt) => ({ src: A(base + '-' + ws[Math.min(1, ws.length - 1)] + '.webp'), srcset: ws.map(w => A(base + '-' + w + '.webp') + ' ' + w + 'w').join(', '), alt });
  const asw = (n, alt) => img('asw-' + n, [480, 960, 1280], alt);
  /* destination categories (BRD 7.4) */
  const CAT = { heritage: 'موقع تراثي', museum: 'متحف', nature: 'طبيعة', viewpoint: 'إطلالة', market: 'سوق' };
  const L = [
    { slug: 'karnak-temple', c: 'heritage', p: 'culture', n: 'معبد الكرنك', area: 'البر الشرقي', s: 'أكبر مجمّع معابد في مصر القديمة بصالة أعمدته الشاهقة وبحيرته المقدسة.',
      d: 'أكبر مجمّع معابد في مصر القديمة، بصالة أعمدته الشاهقة وبحيرته المقدسة وطريق الكباش الذي يصله بمعبد الأقصر.',
      ll: [25.7188, 32.6573], imgs: [img('place-karnak', [480, 736], 'صالة الأعمدة الكبرى في معبد الكرنك')], pos: '50% 60%', rel: ['temple-visits', 'nile-felucca', 'corniche-cafes'] },
    { slug: 'luxor-temple', c: 'heritage', p: 'culture', n: 'معبد الأقصر', area: 'البر الشرقي', s: 'معبد على كورنيش النيل في قلب المدينة، يتألق عند الغروب.',
      d: 'معبد على كورنيش النيل في قلب المدينة، يتألق عند الغروب وتضيئه الأنوار ليلًا.',
      ll: [25.6995, 32.6391], imgs: [img('7f49851b-f977-41e4-a9f4-053337fbd944', [480, 960, 1448], 'معبد الأقصر مضاءً ليلًا')], rel: ['temple-visits', 'corniche-cafes', 'nile-restaurants'] },
    { slug: 'valley-of-the-kings', c: 'heritage', p: 'culture', n: 'وادي الملوك', area: 'البر الغربي', s: 'مقابر ملوك الدولة الحديثة المنحوتة في الجبل بنقوشها الملوّنة.',
      d: 'مقابر ملوك الدولة الحديثة المنحوتة في الجبل، ومنها مقبرة توت عنخ آمون بنقوشها الملوّنة.',
      ll: [25.7402, 32.6014], imgs: [img('place-valley-kings', [480, 960, 1280], 'مدخل وادي الملوك بين الجبال')], pos: '50% 45%', rel: ['west-bank-exploring', 'hot-air-balloon'] },
    { slug: 'hatshepsut-temple', c: 'heritage', p: 'culture', n: 'معبد حتشبسوت', area: 'البر الغربي', s: 'معبد جنائزي بمدرّجاته الثلاثة في حضن جبل الدير البحري.',
      d: 'معبد جنائزي بمدرّجاته الثلاثة في حضن جبل الدير البحري، من أجمل ما شُيّد في عهد الملكة حتشبسوت.',
      ll: [25.7382, 32.6065], imgs: [img('place-hatshepsut', [480, 717], 'معبد حتشبسوت ليلًا')], pos: '50% 62%', rel: ['west-bank-exploring', 'hot-air-balloon'] },
    { slug: 'colossi-of-memnon', c: 'heritage', p: 'culture', n: 'تمثالا ممنون', area: 'البر الغربي', s: 'تمثالان عملاقان لأمنحتب الثالث عند مدخل البر الغربي.',
      d: 'تمثالان عملاقان لأمنحتب الثالث يستقبلان الزائرين عند مدخل البر الغربي منذ أكثر من ثلاثة آلاف عام.',
      ll: [25.7206, 32.6104], imgs: [img('place-memnon', [480, 960], 'تمثالا ممنون في البر الغربي')], pos: '40% 50%', rel: ['west-bank-exploring', 'hot-air-balloon'] }
  ].map(e => ({ ...e, city: 'luxor' }));
  const W = [
    { slug: 'philae-temple', c: 'heritage', p: 'culture', n: 'معبد فيلة', area: 'جزيرة أجيليكا', s: 'معبد إيزيس على جزيرة أجيليكا يُزار بالمراكب وسط النيل.',
      d: 'معبد إيزيس الذي نُقل حجرًا حجرًا إلى جزيرة أجيليكا لإنقاذه من مياه السد، ويُزار بالمراكب وسط النيل.',
      ll: [24.0253, 32.8846], imgs: [asw('philae', 'معبد فيلة على جزيرة أجيليكا'), asw('philae2', 'أعمدة معبد فيلة')], rel: ['philae-temple-visit', 'felucca-nile-tour'] },
    { slug: 'elephantine-island', c: 'nature', p: 'gems', n: 'جزيرة إلفنتين', area: 'وسط النيل', s: 'جزيرة تحمل آثار أسوان القديمة ومقياس النيل وقرى نوبية ملوّنة.',
      d: 'جزيرة تحمل آثار أسوان القديمة ومقياس النيل، وتضمّ قرى نوبية ملوّنة وسط النخيل.',
      ll: [24.087, 32.8869], imgs: [asw('elephantine2', 'جزيرة إلفنتين من النيل'), asw('elephantine', 'قرية نوبية على جزيرة إلفنتين')], rel: ['elephantine-island', 'felucca-nile-tour', 'nubian-restaurants'], ent: ['nubian-silver-workshop'] },
    { slug: 'nubian-museum', c: 'museum', p: 'culture', n: 'متحف النوبة', area: 'أسوان', s: 'متحف يروي تاريخ النوبة وحضارتها بمعمار مستوحى من البيوت النوبية.',
      d: 'متحف يروي تاريخ النوبة وحضارتها من عصور ما قبل التاريخ حتى اليوم، بمعمار مستوحى من البيوت النوبية.',
      ll: [24.0803, 32.8887], imgs: [asw('museum', 'واجهة متحف النوبة')], rel: ['nubian-village-experience', 'local-cafes-aswan'], ent: ['manal-awadallah'] },
    { slug: 'aswan-high-dam', c: 'viewpoint', p: 'gems', n: 'السد العالي', area: 'جنوب أسوان', s: 'أحد أضخم المشاريع الهندسية في مصر الحديثة وخلفه بحيرة ناصر.',
      d: 'أحد أضخم المشاريع الهندسية في مصر الحديثة، وخلفه تمتد بحيرة ناصر إلى الأفق.',
      ll: [23.9707, 32.877], imgs: [asw('dam', 'السد العالي وبحيرة ناصر')], rel: ['philae-temple-visit'] },
    { slug: 'unfinished-obelisk', c: 'heritage', p: 'culture', n: 'المسلة الناقصة', area: 'محاجر الجرانيت', s: 'مسلة عملاقة تُركت في محجرها تكشف كيف قُطع الجرانيت.',
      d: 'مسلة عملاقة تُركت في محجرها بعد تشقّقها، وتكشف كيف قطع المصريون القدماء الجرانيت.',
      ll: [24.0776, 32.8955], imgs: [asw('obelisk', 'المسلة الناقصة في محجر الجرانيت')], rel: ['nubian-silver-workshop', 'local-cafes-aswan'], ent: ['nubian-silver-workshop'] },
    { slug: 'kitchener-island', c: 'nature', p: 'gems', n: 'جزيرة النباتات', area: 'وسط النيل', s: 'حديقة نباتية على جزيرة في النيل بأشجار من قارات عدة.',
      d: 'حديقة نباتية على جزيرة في النيل تضم أشجارًا ونباتات من قارات عدة.',
      ll: [24.0873, 32.879], imgs: [asw('kitchener', 'ممر بين النخيل في جزيرة النباتات')], rel: ['felucca-nile-tour', 'island-stays'] }
  ].map(e => ({ ...e, city: 'aswan' }));
  const list = [...L, ...W];
  const bySlug = s => list.find(e => e.slug === s);
  const byName = (city, n) => list.find(e => e.city === city && e.n === n);
  const href = e => 'destination.html?city=' + e.city + '&slug=' + e.slug;
  const related = e => (window.EXPERIENCES ? EXPERIENCES.list : []).filter(x => (e.rel || []).includes(x.slug));
  const owners = e => (window.ENTREPRENEURS ? ENTREPRENEURS.published() : []).filter(x => (e.ent || []).includes(x.slug));
  return { CAT, list, bySlug, byName, href, related, owners };
})();
