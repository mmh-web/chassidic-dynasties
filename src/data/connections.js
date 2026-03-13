// Cross-dynasty connections that make the tree come alive
// Types: 'rivalry', 'marriage', 'influence', 'split', 'holocaust', 'geographic'

export const connections = [
  // === RIVALRIES & TENSIONS ===
  {
    id: 'kotzk-mainstream',
    type: 'rivalry',
    figureIds: ['menachem-mendel-kotzk', 'simcha-bunim'],
    title: 'The Kotzk Revolution',
    description: 'The Kotzker Rebbe took Peshischa\'s emphasis on truth to an extreme — rejecting social norms and demanding radical authenticity. Many followers couldn\'t handle the intensity. After the Kotzker\'s seclusion, the movement split: most went to Ger (moderated), while a few stayed loyal to the Kotzk ideal.',
    relatedBranches: ['polish'],
  },
  {
    id: 'satmar-chabad',
    type: 'rivalry',
    figureIds: ['joel-satmar', 'menachem-mendel-7'],
    title: 'The Great Zionism Divide',
    description: 'The Satmar Rebbe and the Lubavitcher Rebbe represented opposite poles on Zionism. R\' Joel fiercely opposed the State of Israel on theological grounds; the Rebbe engaged with it pragmatically, sending emissaries and supporting the IDF. This ideological divide continues to shape Chassidic politics today.',
    relatedBranches: ['satmar', 'chabad'],
  },
  {
    id: 'sanz-sadigura',
    type: 'rivalry',
    figureIds: ['chaim-sanz', 'avraham-yaakov-sadigura'],
    title: 'The Sanz-Sadigura War',
    description: 'One of the bitterest feuds in Chassidic history. The Divrei Chaim of Sanz and the Sadigura Rebbe clashed over Haskalah (Enlightenment) and the proper role of a rebbe. Both sides issued bans against each other. The feud divided Galician Jewry for generations — families literally chose sides. A formal peace was only made decades later.',
    relatedBranches: ['galician', 'ruzhin'],
  },
  {
    id: 'munkacs-belz',
    type: 'rivalry',
    figureIds: ['chaim-elazar-munkacs', 'aharon-belz'],
    title: 'Munkacs vs. Belz & Agudah',
    description: 'The Minchas Elazar of Munkacs opposed not just Zionism but also Agudath Israel — the Orthodox political party that Belz and Ger supported. He saw any engagement with modern political structures as dangerous. This created a three-way tension: Satmar (anti-everything), Munkacs (anti-Agudah), and Belz/Ger (pro-Agudah).',
    relatedBranches: ['galician', 'belz'],
  },

  // === MARRIAGES & FAMILY TIES ===
  {
    id: 'chabad-ger-marriage',
    type: 'marriage',
    figureIds: ['menachem-mendel-3', 'yitzchak-meir-ger'],
    title: 'Chabad-Ger Connection',
    description: 'The Tzemach Tzedek (3rd Chabad Rebbe) and the Chiddushei HaRim (1st Gerrer Rebbe) were contemporaries who maintained correspondence. Both were major halachic authorities as well as Chassidic leaders — a rare combination. Their intellectual styles differed (Chabad = mystical-philosophical; Ger = legal-ethical) but they respected each other deeply.',
    relatedBranches: ['chabad', 'polish'],
  },
  {
    id: 'chabad-7th-marriage',
    type: 'marriage',
    figureIds: ['menachem-mendel-7', 'yosef-yitzchak-6'],
    title: 'The Son-in-Law Successor',
    description: 'The 7th Lubavitcher Rebbe married the previous Rebbe\'s daughter — making him a son-in-law, not a son. This is unusual in Chassidic succession where leadership typically passes father-to-son. His selection was contested by his brother-in-law, but his extraordinary scholarship and leadership won over the movement.',
    relatedBranches: ['chabad'],
  },
  {
    id: 'ruzhin-vizhnitz',
    type: 'marriage',
    figureIds: ['yisroel-ruzhin', 'menachem-mendel-vizhnitz'],
    title: 'Ruzhin-Vizhnitz Family Link',
    description: 'The Vizhnitz dynasty emerged from the Ruzhin orbit through marriage — the Tzemach Tzaddik of Vizhnitz was connected to the Kosov-Ruzhin family network. This is why Vizhnitz appears under the Ruzhin branch in some genealogies, though it developed its own distinct identity emphasizing "Ahavat Yisroel" (love of every Jew).',
    relatedBranches: ['ruzhin', 'vizhnitz'],
  },

  // === SPLITS & SUCCESSION CRISES ===
  {
    id: 'satmar-split',
    type: 'split',
    figureIds: ['aaron-satmar', 'zalman-satmar'],
    title: 'The Satmar Split (2006)',
    description: 'When R\' Moshe Teitelbaum died in 2006, his two sons each claimed leadership. The elder son Aharon took Kiryas Joel (the Satmar village in upstate NY); the younger Zalman Leib held Williamsburg, Brooklyn. The split went to secular courts, divided families, and created parallel institutions — two rebbes, two school systems, two charitable networks. It remains unresolved.',
    relatedBranches: ['satmar'],
  },
  {
    id: 'chabad-no-successor',
    type: 'split',
    figureIds: ['menachem-mendel-7'],
    title: 'Chabad After 1994',
    description: 'The 7th Rebbe died without children or a named successor. Unlike Breslov (where the founder declared no successor), this was unexpected. The movement continued to grow dramatically without a living rebbe — run by a network of emissaries. Some followers believe the Rebbe is the Messiah; mainstream Chabad focuses on outreach. No 8th Rebbe has been appointed.',
    relatedBranches: ['chabad'],
  },
  {
    id: 'belz-nephew',
    type: 'split',
    figureIds: ['aharon-belz', 'yissachar-dov-belz-2'],
    title: 'Belz: The Boy Rebbe',
    description: 'R\' Aharon of Belz lost his entire family in the Holocaust. He appointed his nephew\'s son — an 18-year-old — as his successor. The current Belzer Rebbe has led since 1966, building the massive Belz Great Synagogue in Jerusalem (one of the largest in the world) and growing the community to tens of thousands.',
    relatedBranches: ['belz'],
  },

  // === HOLOCAUST & REBUILDING ===
  {
    id: 'holocaust-ger',
    type: 'holocaust',
    figureIds: ['avraham-mordechai-ger'],
    title: 'Ger: From 100,000 to Ashes',
    description: 'Before WWII, Ger was the largest Chassidic group in Poland with ~100,000 followers. The Imrei Emes escaped to Israel in 1940 but lost most of his family and nearly all his followers. He died in 1948, heartbroken. His descendants rebuilt Ger into one of the largest groups in Israel — a remarkable resurrection.',
    relatedBranches: ['polish'],
  },
  {
    id: 'holocaust-klausenburg',
    type: 'holocaust',
    figureIds: ['yekusiel-klausenburg'],
    title: 'Klausenburg: Lost Everything, Built Everything',
    description: 'The Klausenburger Rebbe survived the camps after losing his wife and all 11 children. He remarried, had more children, and built Kiryat Sanz in Netanya (Israel) and a community in Union City, NJ. He also founded Laniado Hospital in Netanya — turning his suffering into institutions that serve thousands.',
    relatedBranches: ['galician'],
  },
  {
    id: 'holocaust-bobov',
    type: 'holocaust',
    figureIds: ['ben-zion-bobov', 'shlomo-bobov-3'],
    title: 'Bobov: Father Murdered, Son Rebuilds',
    description: 'The 2nd Bobover Rebbe (R\' Ben Zion) was murdered by the Nazis in 1941. His son Shlomo survived and rebuilt Bobov in Borough Park, Brooklyn — emphasizing the music and warmth that characterized pre-war Bobov. The community grew to thousands of families.',
    relatedBranches: ['galician'],
  },
  {
    id: 'holocaust-satmar-kastner',
    type: 'holocaust',
    figureIds: ['joel-satmar'],
    title: 'The Kastner Train Paradox',
    description: 'R\' Joel Teitelbaum was rescued from Bergen-Belsen on the Kastner train — a controversial deal between a Zionist leader and the Nazis that saved ~1,700 Jews. The irony is intense: the fiercest anti-Zionist rebbe was saved by a Zionist negotiation. This paradox is rarely discussed within Satmar.',
    relatedBranches: ['satmar'],
  },

  // === INFLUENCE & INTELLECTUAL CONNECTIONS ===
  {
    id: 'elimelech-spread',
    type: 'influence',
    figureIds: ['elimelech'],
    title: 'One Teacher, Many Dynasties',
    description: 'R\' Elimelech of Lizhensk didn\'t found a dynasty of his own — but his students founded nearly all of Polish and Galician Chassidus. The Seer of Lublin, from whom came Peshischa, Kotzk, Ger, Belz, and Satmar. His book "Noam Elimelech" is still placed on the Shabbat table in many Chassidic homes. His grave in Lizhensk draws thousands annually.',
    relatedBranches: ['polish', 'galician', 'belz', 'satmar'],
  },
  {
    id: 'chernobyl-8-sons',
    type: 'influence',
    figureIds: ['mordechai-chernobyl'],
    title: 'Eight Sons, Eight Courts',
    description: 'The Chernobyler Maggid had 8 sons, and each established his own court — creating an instant dynasty network across Ukraine. Skver, Rachmistrivka, Talna, and others all trace back to this single family. It\'s the largest single-generation branching in all of Chassidic history.',
    relatedBranches: ['chernobyl'],
  },
  {
    id: 'breslov-unique',
    type: 'influence',
    figureIds: ['nachman', 'noson-breslov'],
    title: 'The Only Dynasty Without a Rebbe',
    description: 'Rebbe Nachman told his followers before he died: "My fire will burn until the coming of Moshiach." His student Reb Noson preserved and published his teachings but never claimed to be a rebbe. To this day, Breslover Chassidim have no living rebbe — they call themselves "the dead Chassidim" (with a rebbe who\'s no longer alive). Annual Rosh Hashanah pilgrimage to Uman, Ukraine draws 30,000+.',
    relatedBranches: ['breslov'],
  },
];
