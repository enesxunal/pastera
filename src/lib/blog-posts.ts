export type BlogSection = { heading: string; body: string };
export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  city: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "beste-restaurants-koeln-2026",
    title:
      "Beste Restaurants in Köln 2026? Eine aktuelle Auswahl statt einer beliebigen Rangliste",
    seoTitle: "Beste Restaurants Köln 2026",
    description:
      "Restaurants in Köln 2026: eine aktuelle, transparente Auswahl spannender Adressen in Ehrenfeld, Innenstadt und Belgischem Viertel.",
    city: "Köln",
    keywords: [
      "beste Restaurants Köln",
      "Restaurants Köln 2026",
      "Restaurant Empfehlungen Köln",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Was bedeutet überhaupt ‚bestes Restaurant‘?",
        body: "Eine seriöse Empfehlung hängt vom Anlass ab. Deshalb ist diese Liste kein künstliches Ranking. Sie bündelt Adressen, die 2026 in aktuellen Kölner Gastro-Guides, Neueröffnungslisten oder lokalen Restaurantberichten auffallen – von Pasta über kölsche Küche bis Fine Dining.",
      },
      {
        heading: "Ehrenfeld: Pastera, Haus Scholzen und Nonna Napoli",
        body: "Pastera ist seit Juli 2026 an der Venloer Straße 342 neu dabei und konzentriert sich auf Pasta, Saucen, Toppings sowie vegane Optionen. Haus Scholzen ist dagegen ein etablierter Tipp für kölsche Klassiker. Nonna Napoli steht in Ehrenfeld für neapolitanische Pizza und Pasta. Drei Adressen, drei sehr unterschiedliche Gründe für einen Besuch.",
      },
      {
        heading: "Für einen besonderen Abend: Kluth, Toki und OTTO Für Dich",
        body: "Aktuelle Kölner Restaurantberichte heben unter anderem Kluth in Ehrenfeld, Toki im Belgischen Viertel und OTTO Für Dich in der Innenstadt hervor. Diese Adressen passen eher zu Gästen, die einen längeren Restaurantabend und ein stärker kuratiertes Küchenkonzept suchen.",
      },
      {
        heading: "Neue Gastro beobachten: Bar Brio und weitere Neueröffnungen",
        body: "Bar Brio wurde 2026 als spannende Neueröffnung im Belgischen Viertel besprochen. Gleichzeitig kommen laufend neue Konzepte hinzu. Wer wirklich aktuell bleiben möchte, sollte deshalb lokale Gastro-Medien, Google Maps und die offiziellen Kanäle der Restaurants kombinieren.",
      },
      {
        heading: "Welche Adresse passt zu dir?",
        body: "Für unkomplizierte Pasta und flexible Kombinationen ist Pastera eine andere Wahl als ein Fine-Dining-Abend oder ein kölsches Traditionsrestaurant. Die sinnvollste Bestenliste beginnt deshalb nicht mit Platz 1, sondern mit der Frage: Worauf hast du heute Lust?",
      },
    ],
  },
  {
    slug: "neue-restaurants-koeln-2026",
    title: "Neue Restaurants in Köln 2026: Food-Spots, die du kennen solltest",
    seoTitle: "Neue Restaurants Köln 2026",
    description:
      "Kölns Gastro-Szene verändert sich schnell. Diese Auswahl zeigt neue und interessante Food-Spots – inklusive Pastera in Ehrenfeld.",
    city: "Köln",
    keywords: [
      "neue Restaurants Köln 2026",
      "Restaurant Neueröffnung Köln",
      "Essen gehen Köln",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Kölns Gastro-Szene 2026",
        body: "2026 ist in Köln ein starkes Jahr für Neueröffnungen. Von modernen Bistro-Konzepten bis zu Nudel-, Streetfood- und Fine-Dining-Adressen entstehen in vielen Veedeln neue Anlaufstellen. Wer nach „neue Restaurants Köln“ sucht, will deshalb vor allem wissen: Was ist wirklich neu, wo liegt es und welches Konzept steckt dahinter?",
      },
      {
        heading: "Pastera in Ehrenfeld",
        body: "Pastera gehört zu den Kölner Neueröffnungen 2026. Der Standort an der Venloer Straße 342 in Ehrenfeld hat am 3. Juli eröffnet. Im Mittelpunkt stehen Pasta-Gerichte, verschiedene Saucen und Toppings sowie vegetarische und vegane Möglichkeiten. Das Konzept ist auf individuelle Kombinationen und moderne Pasta ausgelegt.",
      },
      {
        heading: "Weitere neue Konzepte beobachten",
        body: "Auch rund um das Belgische Viertel, die Innenstadt und Ehrenfeld entstehen laufend neue Restaurants. Für einen aktuellen Überblick lohnt sich ein Blick auf lokale Gastro-Medien. Entscheidend ist nicht nur der Hype zur Eröffnung, sondern ob Konzept, Küche und Atmosphäre auch nach den ersten Wochen überzeugen.",
      },
      {
        heading: "Unser Tipp für deine Food-Tour",
        body: "Plane nicht zu viele Stops. Zwei bis drei Adressen in einem Veedel sind oft spannender als eine Tour quer durch die Stadt. In Ehrenfeld lassen sich Restaurants rund um die Venloer Straße besonders gut mit Cafés, Bars und kleinen Läden verbinden.",
      },
    ],
  },
  {
    slug: "restaurants-ehrenfeld-guide",
    title:
      "Restaurants in Köln-Ehrenfeld: Ein Guide für gutes Essen rund um die Venloer Straße",
    seoTitle: "Restaurants Ehrenfeld",
    description:
      "Restaurants in Köln-Ehrenfeld entdecken: Pasta, Pizza, internationale Küche und moderne Food-Spots rund um die Venloer Straße.",
    city: "Köln",
    keywords: [
      "Restaurants Ehrenfeld",
      "Essen Ehrenfeld",
      "Venloer Straße Restaurant",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Warum Ehrenfeld kulinarisch spannend ist",
        body: "Ehrenfeld gehört zu den vielfältigsten Gastro-Veedeln Kölns. Rund um Venloer Straße und Gürtel liegen klassische Restaurants, neue Konzepte, Imbisse, Cafés und Bars dicht beieinander. Genau diese Mischung macht das Viertel für spontane Restaurantbesuche interessant.",
      },
      {
        heading: "Pasta auf der Venloer Straße",
        body: "Bei Pastera an der Venloer Straße 342 stehen Pasta, Saucen und Toppings im Mittelpunkt. Wer gerne auswählt und kombiniert, kann unterschiedliche Pastasorten, cremige oder tomatige Saucen und verschiedene Extras entdecken. Vegane Optionen gehören ebenfalls zum Menü.",
      },
      {
        heading: "Mehr als Pasta",
        body: "Ehrenfeld bietet deutlich mehr als italienisch inspirierte Küche. Rund um die Venloer Straße findest du unter anderem neapolitanische Pizza, kölsche Klassiker, internationale Küche, Bowls und moderne Bistro-Konzepte. Dadurch eignet sich das Viertel besonders gut für Gruppen mit unterschiedlichen Vorlieben.",
      },
      {
        heading: "So findest du den richtigen Spot",
        body: "Überlege zuerst, ob du schnell und unkompliziert essen, einen längeren Abend verbringen oder mehrere kleine Stops kombinieren möchtest. Für spontane Besuche ist die Gegend rund um Venloer Straße/Gürtel besonders praktisch.",
      },
    ],
  },
  {
    slug: "pasta-koeln",
    title:
      "Pasta in Köln: Wo moderne Pasta, Saucen und Toppings im Mittelpunkt stehen",
    seoTitle: "Pasta Köln",
    description:
      "Pasta in Köln entdecken: moderne Pasta-Gerichte, Saucen, Toppings und vegane Optionen bei Pastera in Köln-Ehrenfeld.",
    city: "Köln",
    keywords: ["Pasta Köln", "Pasta Restaurant Köln", "frische Pasta Köln"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Pasta kann mehr als Klassiker",
        body: "Wer in Köln nach Pasta sucht, meint längst nicht nur Carbonara oder Bolognese. Moderne Pasta-Konzepte kombinieren unterschiedliche Nudeln, Saucen, Toppings und Texturen. Genau diese Vielfalt macht Pasta zu einem Gericht, das sich sehr individuell gestalten lässt.",
      },
      {
        heading: "Pastera in Köln-Ehrenfeld",
        body: "Pastera an der Venloer Straße 342 verbindet fertige Pasta-Gerichte mit einem Baukastenprinzip. Neben klassischen Geschmacksrichtungen gibt es würzige, cremige und vegane Varianten. So kann derselbe Restaurantbesuch für verschiedene Vorlieben funktionieren.",
      },
      {
        heading: "Worauf du bei einem Pasta-Restaurant achten kannst",
        body: "Eine gute Pasta-Adresse sollte mehr bieten als eine lange Karte: klare Kombinationen, nachvollziehbare Zutaten und eine Auswahl, die nicht beliebig wirkt. Wer vegan isst, sollte außerdem leicht erkennen können, welche Pasta, Sauce und Toppings zusammenpassen.",
      },
      {
        heading: "Pasta als unkompliziertes Essen in Köln",
        body: "Pasta eignet sich für Mittagspause, frühen Abend oder einen spontanen Besuch mit Freunden. Besonders in Ehrenfeld lässt sich ein Restaurantbesuch gut mit einem Spaziergang durch das Veedel verbinden.",
      },
    ],
  },
  {
    slug: "pasta-ehrenfeld",
    title: "Pasta in Ehrenfeld: Ein Food-Guide rund um die Venloer Straße",
    seoTitle: "Pasta Ehrenfeld",
    description:
      "Pasta in Ehrenfeld: moderne Pasta-Gerichte und vegane Optionen auf der Venloer Straße in Köln.",
    city: "Köln",
    keywords: [
      "Pasta Ehrenfeld",
      "Pasta Venloer Straße",
      "Restaurant Ehrenfeld Pasta",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Pasta im Herzen von Ehrenfeld",
        body: "Die Venloer Straße ist eine der wichtigsten Gastro-Achsen des Viertels. Zwischen Cafés, Bars und internationalen Restaurants finden Pasta-Fans verschiedene Möglichkeiten für einen unkomplizierten Restaurantbesuch.",
      },
      {
        heading: "Pastera auf der Venloer Straße",
        body: "Pastera liegt an der Venloer Straße 342. Das Menü setzt auf Pasta, Saucen und Toppings sowie benannte Gerichte. Wer sich vegan ernährt, findet eigene Optionen und passende Kombinationen.",
      },
      {
        heading: "Für wen eignet sich das Konzept?",
        body: "Für Gruppen mit unterschiedlichen Geschmäckern ist ein modular aufgebautes Pasta-Menü praktisch: Eine Person möchte scharf, eine andere cremig, eine dritte vegan. Statt völlig unterschiedlicher Küchen bleibt die gemeinsame Basis Pasta.",
      },
      {
        heading: "Ehrenfeld danach weiter entdecken",
        body: "Nach dem Essen liegen viele Cafés, Bars und Kulturorte in Laufnähe. Dadurch ist Pasta in Ehrenfeld nicht nur eine Mahlzeit, sondern kann Teil eines ganzen Abends im Veedel sein.",
      },
    ],
  },
  {
    slug: "vegan-essen-koeln",
    title:
      "Vegan essen in Köln: Pasta und weitere Optionen für einen unkomplizierten Restaurantbesuch",
    seoTitle: "Vegan essen Köln",
    description:
      "Vegan essen in Köln: Tipps für Restaurantwahl, vegane Pasta und Food-Spots in Ehrenfeld.",
    city: "Köln",
    keywords: [
      "vegan essen Köln",
      "vegan Restaurant Köln",
      "vegane Pasta Köln",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Vegane Auswahl wird wichtiger",
        body: "In Köln gehört eine nachvollziehbare vegane Auswahl für viele Gäste inzwischen zur Restaurantentscheidung. Besonders hilfreich sind Konzepte, bei denen vegane Komponenten klar gekennzeichnet und frei kombinierbar sind.",
      },
      {
        heading: "Vegane Pasta bei Pastera",
        body: "Bei Pastera sind vegane Optionen Bestandteil des Konzepts. So lassen sich vegane Pasta-Varianten mit passenden Saucen und Toppings entdecken, ohne dass vegane Gäste auf eine einzelne Alibi-Option beschränkt sind.",
      },
      {
        heading: "Darauf kannst du achten",
        body: "Nicht jede Pasta ist automatisch vegan. Eier in Nudeln, Käse in Pesto oder Sahne in Saucen sind typische Stolpersteine. Gute Menüs machen deshalb transparent, welche Komponenten vegan sind.",
      },
      {
        heading: "Ehrenfeld als guter Ausgangspunkt",
        body: "Ehrenfeld bietet viele vegetarische und vegane Möglichkeiten in kurzer Distanz. Das macht das Veedel zu einer guten Wahl, wenn in einer Gruppe unterschiedliche Ernährungsweisen zusammenkommen.",
      },
    ],
  },
  {
    slug: "halal-essen-koeln",
    title:
      "Halal essen in Köln: Moderne Restaurantkonzepte und Pasta in Ehrenfeld",
    seoTitle: "Halal essen Köln",
    description:
      "Halal essen in Köln: Pastera in Ehrenfeld und Tipps für die Auswahl moderner Restaurantkonzepte.",
    city: "Köln",
    keywords: ["halal essen Köln", "halal Restaurant Köln", "halal Ehrenfeld"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Halal-Angebote in Köln",
        body: "Köln hat eine große Auswahl an Restaurants mit halal Angeboten. Für Gäste ist dabei entscheidend, dass Informationen klar kommuniziert werden und nicht nur über Bewertungen oder Kommentare Dritter auffindbar sind.",
      },
      {
        heading: "Pastera und halal",
        body: "Lokale Berichterstattung zur Kölner Eröffnung beschreibt das gesamte Angebot von Pastera als halal. Gleichzeitig gibt es vegetarische und vegane Optionen, wodurch das Konzept für Gruppen mit unterschiedlichen Ernährungswünschen interessant ist.",
      },
      {
        heading: "Vor dem Besuch prüfen",
        body: "Angebote und Lieferketten können sich ändern. Wer besondere Anforderungen hat, sollte aktuelle Hinweise des Restaurants beachten oder direkt nachfragen.",
      },
      {
        heading: "Ehrenfeld kulinarisch kombinieren",
        body: "Wer in Ehrenfeld unterwegs ist, findet entlang der Venloer Straße zahlreiche internationale Konzepte. So lässt sich ein Restaurantbesuch gut mit einem längeren Abend im Viertel verbinden.",
      },
    ],
  },
  {
    slug: "essen-venloer-strasse",
    title:
      "Essen auf der Venloer Straße: Restaurants und Food-Spots in Köln-Ehrenfeld",
    seoTitle: "Essen Venloer Straße",
    description:
      "Wo kann man auf der Venloer Straße essen? Ein Guide für Köln-Ehrenfeld mit Pasta und weiteren Food-Ideen.",
    city: "Köln",
    keywords: [
      "Essen Venloer Straße",
      "Restaurants Venloer Straße",
      "Ehrenfeld essen gehen",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Eine der spannendsten Straßen für Food in Köln",
        body: "Die Venloer Straße zieht sich durch mehrere Kölner Viertel und ist besonders in Ehrenfeld dicht mit Gastronomie besetzt. Rund um den Bahnhof Köln-Ehrenfeld und den Gürtel findest du Restaurants, Cafés und Imbisse für fast jede Tageszeit.",
      },
      {
        heading: "Pasta bei Pastera",
        body: "An der Venloer Straße 342 liegt Pastera. Das Konzept konzentriert sich auf Pasta-Gerichte, Saucen, Toppings sowie vegane Varianten. Dadurch ist die Adresse vor allem für Gäste interessant, die Pasta modern und individuell mögen.",
      },
      {
        heading: "Food-Tour statt einzelner Stop",
        body: "Die Venloer Straße eignet sich gut für eine kleine Food-Tour: erst etwas essen, danach Dessert oder Kaffee und später eine Bar. Viele Ziele liegen nah genug beieinander, um zu Fuß weiterzugehen.",
      },
      {
        heading: "Anreise",
        body: "Mit Stadtbahn und S-Bahn ist Ehrenfeld gut angebunden. Gerade am Wochenende kann eine Anreise mit öffentlichen Verkehrsmitteln entspannter sein als die Parkplatzsuche.",
      },
    ],
  },
  {
    slug: "food-spots-koeln",
    title:
      "Food-Spots in Köln 2026: Ideen für deinen nächsten kulinarischen Tag",
    seoTitle: "Food-Spots Köln",
    description:
      "Food-Spots Köln 2026: Ideen für Ehrenfeld, Belgisches Viertel und weitere Veedel – von Pasta bis Bistro.",
    city: "Köln",
    keywords: ["Food Spots Köln", "Essen gehen Köln", "Köln Restaurant Tipps"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Köln isst nach Veedel",
        body: "Die besten Food-Tage in Köln entstehen oft nicht durch eine einzelne Top-10-Liste, sondern durch ein Viertel. Ehrenfeld, Belgisches Viertel, Südstadt und Innenstadt haben jeweils eine eigene Gastro-Dichte und Atmosphäre.",
      },
      {
        heading: "Ehrenfeld für neue Konzepte",
        body: "Ehrenfeld verbindet etablierte Adressen mit vielen Neueröffnungen. Pastera ist seit Juli 2026 Teil dieser Szene und bringt ein modernes Pasta-Konzept auf die Venloer Straße.",
      },
      {
        heading: "So planst du deinen Tag",
        body: "Wähle ein Veedel, einen Hauptspot und zwei spontane Optionen. Reserviere nur dort, wo es nötig ist. So bleibt genug Freiheit für Cafés, kleine Läden oder einen ungeplanten zweiten Food-Stop.",
      },
      {
        heading: "Was einen guten Food-Spot ausmacht",
        body: "Nicht nur Social-Media-Hype zählt. Gute Erreichbarkeit, klares Konzept, nachvollziehbare Karte und eine Atmosphäre, die zum Anlass passt, sind meist wichtiger.",
      },
    ],
  },
  {
    slug: "restaurant-koeln-abends",
    title:
      "Abends essen in Köln: Welche Viertel sich für einen Restaurantbesuch eignen",
    seoTitle: "Abends essen Köln",
    description:
      "Abends essen in Köln: Ehrenfeld, Belgisches Viertel und weitere Gegenden für Restaurants und einen ganzen Abend.",
    city: "Köln",
    keywords: [
      "abends essen Köln",
      "Restaurant Köln abends",
      "Essen gehen Köln abends",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Restaurant plus Abendprogramm",
        body: "Wer abends essen geht, entscheidet nicht nur nach Küche. Wichtig ist auch, was danach passiert. Ehrenfeld und das Belgische Viertel sind deshalb beliebt: Restaurants, Bars und Kultur liegen relativ dicht beieinander.",
      },
      {
        heading: "Ehrenfeld und Pasta",
        body: "Für einen unkomplizierten Start in den Abend ist Pasta eine flexible Wahl. Pastera liegt direkt auf der Venloer Straße und lässt sich gut mit weiteren Stops im Viertel verbinden.",
      },
      {
        heading: "Früh oder spät?",
        body: "Gerade freitags und samstags verändert die Uhrzeit das Erlebnis. Früher ist die Auswahl oft größer, später wird es lebhafter. Prüfe Öffnungszeiten immer aktuell, besonders an Feiertagen.",
      },
      {
        heading: "Mit Gruppen planen",
        body: "Bei Gruppen helfen Restaurants mit klar strukturierten Menüs und vegetarischen beziehungsweise veganen Optionen. So findet jeder leichter etwas Passendes.",
      },
    ],
  },
  {
    slug: "koeln-restaurants-tipps",
    title:
      "Restaurants in Köln: So findest du den passenden Spot statt nur irgendeine Top-10-Liste",
    seoTitle: "Restaurants Köln Tipps",
    description:
      "Restaurants in Köln finden: praktische Tipps nach Veedel, Anlass, Küche und Ernährungswunsch.",
    city: "Köln",
    keywords: [
      "Restaurants Köln",
      "beste Restaurants Köln",
      "Restaurant Tipps Köln",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Die „beste“ Adresse hängt vom Anlass ab",
        body: "Eine pauschale Liste der besten Restaurants hilft nur begrenzt. Für ein Date gelten andere Kriterien als für eine schnelle Mittagspause, eine Gruppe oder veganes Essen. Besser ist es, zuerst Anlass und Veedel festzulegen.",
      },
      {
        heading: "Nach Viertel suchen",
        body: "Ehrenfeld eignet sich für einen lebhaften Abend und viele spontane Optionen. Das Belgische Viertel bietet Bars und moderne Restaurants, die Südstadt wirkt oft etwas entspannter. Innenstadt und Altstadt sind praktisch für Besucher, aber nicht automatisch die spannendste Wahl.",
      },
      {
        heading: "Nach Küche suchen",
        body: "Wer gezielt Pasta möchte, sollte nach Pasta-Konzepten suchen statt nur nach „italienisch“. Pastera in Ehrenfeld ist beispielsweise klar auf Pasta, Saucen und Toppings fokussiert.",
      },
      {
        heading: "Aktualität prüfen",
        body: "Gerade bei Neueröffnungen ändern sich Öffnungszeiten und Angebote schnell. Prüfe deshalb vor dem Besuch die aktuelle Website oder das Social-Media-Profil des Restaurants.",
      },
    ],
  },
  {
    slug: "pastera-koeln-eroeffnung",
    title:
      "Pastera Köln: Von der Neueröffnung in Ehrenfeld zum modernen Pasta-Spot",
    seoTitle: "Pastera Köln Eröffnung",
    description:
      "Pastera Köln in Ehrenfeld: Was hinter dem Pasta-Konzept auf der Venloer Straße steckt.",
    city: "Köln",
    keywords: ["Pastera Köln", "Pastera Ehrenfeld", "Pastera Venloer Straße"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Seit Juli 2026 in Ehrenfeld",
        body: "Pastera hat am 3. Juli 2026 an der Venloer Straße 342 eröffnet. Die Eröffnung sorgte durch eine stark nachgefragte 99-Cent-Aktion direkt für Aufmerksamkeit. Seitdem ist Pastera Teil der neuen Gastro-Welle in Köln.",
      },
      {
        heading: "Die Idee",
        body: "Im Mittelpunkt steht Pasta, die über verschiedene Saucen und Toppings unterschiedlich kombiniert werden kann. Zusätzlich gibt es benannte Gerichte. Vegane und vegetarische Möglichkeiten gehören zum Konzept.",
      },
      {
        heading: "Warum Ehrenfeld",
        body: "Ehrenfeld passt zu einem modernen, unkomplizierten Food-Konzept: Das Viertel ist jung, vielfältig und gastronomisch stark frequentiert. Die Venloer Straße ist dabei eine der zentralen Achsen.",
      },
      {
        heading: "Was als Nächstes kommt",
        body: "Pastera entwickelt die Marke weiter. Neben Köln ist ein Standort in Dortmund geplant. Details zu Adresse und Eröffnung veröffentlichen wir, sobald sie final bestätigt und kommunizierbar sind.",
      },
    ],
  },
  {
    slug: "pasta-saucen-guide",
    title: "Welche Pasta passt zu welcher Sauce? Ein einfacher Guide",
    seoTitle: "Pasta Sauce Guide",
    description:
      "Welche Pasta passt zu welcher Sauce? Ein praktischer Guide für cremige, tomatige, würzige und vegane Kombinationen.",
    city: "Guide",
    keywords: ["Pasta Sauce Guide", "Pasta mit Sauce", "Pasta Kombinationen"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Tomatig und frisch",
        body: "Tomatige Saucen funktionieren besonders gut mit Pasta, die Sauce gut aufnimmt. Kräuter, Parmesan oder vegane Alternativen und frische Toppings können Säure und Süße ausbalancieren.",
      },
      {
        heading: "Cremig und kräftig",
        body: "Cremige Saucen vertragen Zutaten mit Struktur: Pilze, Spinat oder kräftige Toppings sorgen dafür, dass das Gericht nicht eindimensional wirkt.",
      },
      {
        heading: "Scharf",
        body: "Bei scharfen Saucen helfen milde Komponenten, damit Chili nicht alles überdeckt. Eine cremige Komponente oder ein frisches Topping kann den Kontrast verbessern.",
      },
      {
        heading: "Vegan kombinieren",
        body: "Vegane Pasta muss geschmacklich nicht reduziert sein. Tomate, Pesto-Varianten, Gemüse, Pilze, Kräuter und pflanzliche Cremes ermöglichen sehr unterschiedliche Profile.",
      },
    ],
  },
  {
    slug: "vegane-pasta-guide",
    title: "Vegane Pasta: Zutaten, Saucen und Toppings richtig kombinieren",
    seoTitle: "Vegane Pasta Guide",
    description:
      "Vegane Pasta richtig kombinieren: Welche Nudeln, Saucen und Toppings funktionieren und worauf du achten solltest.",
    city: "Guide",
    keywords: ["vegane Pasta", "vegane Pasta Sauce", "vegan Pasta Restaurant"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Ist Pasta immer vegan?",
        body: "Nein. Manche Nudeln enthalten Ei. Auch bei Saucen können Butter, Sahne, Käse oder klassisches Pesto tierische Bestandteile enthalten. Wer vegan isst, sollte deshalb die gesamte Kombination betrachten.",
      },
      {
        heading: "Geschmack aufbauen",
        body: "Eine gute vegane Pasta kombiniert mehrere Ebenen: eine aromatische Sauce, Gemüse oder Pilze, etwas Frisches und bei Bedarf Crunch. So entsteht ein vollständiges Gericht statt einer bloßen Ersatzlösung.",
      },
      {
        heading: "Cremige vegane Saucen",
        body: "Pflanzliche Cremes, Nüsse oder püriertes Gemüse können cremige Texturen liefern. Wichtig ist eine gute Balance aus Salz, Säure und Umami.",
      },
      {
        heading: "Bei Pastera",
        body: "Pastera kennzeichnet vegane Optionen im Menü und bietet vegane Kombinationen innerhalb des Pasta-Konzepts an.",
      },
    ],
  },
  {
    slug: "pasta-toppings-guide",
    title:
      "Pasta Toppings: So wird aus einer einfachen Pasta dein eigenes Gericht",
    seoTitle: "Pasta Toppings",
    description:
      "Pasta Toppings Guide: Gemüse, Protein, Crunch und Kräuter sinnvoll kombinieren.",
    city: "Guide",
    keywords: [
      "Pasta Toppings",
      "Pasta selbst zusammenstellen",
      "Pasta Zutaten",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Weniger ist oft mehr",
        body: "Viele Toppings bedeuten nicht automatisch mehr Geschmack. Zwei oder drei Komponenten mit klarer Funktion sind oft besser als eine überladene Schüssel.",
      },
      {
        heading: "Vier Rollen für Toppings",
        body: "Denke in Rollen: etwas Herzhaftes, etwas Frisches, eine Textur und optional ein kräftiger Akzent. So lassen sich Zutaten leichter kombinieren.",
      },
      {
        heading: "Sauce zuerst denken",
        body: "Die Sauce gibt die Richtung vor. Zu einer kräftigen Sauce passen eher zurückhaltende Toppings; eine einfache Tomatensauce kann mehr Kontrast vertragen.",
      },
      {
        heading: "Eigene Kombinationen testen",
        body: "Ein Baukasten-Konzept ist ideal, um neue Kombinationen auszuprobieren. Merke dir, welche Sauce-Topping-Paare funktionieren, und variiere beim nächsten Besuch nur eine Komponente.",
      },
    ],
  },
  {
    slug: "neue-restaurants-dortmund-2026",
    title:
      "Neue Restaurants in Dortmund 2026: Welche Gastro-Konzepte gerade spannend sind",
    seoTitle: "Neue Restaurants Dortmund 2026",
    description:
      "Neue Restaurants Dortmund 2026: spannende Gastro-Konzepte, Trends und was bei Pastera Dortmund geplant ist.",
    city: "Dortmund",
    keywords: [
      "neue Restaurants Dortmund 2026",
      "Restaurant Neueröffnung Dortmund",
      "Dortmund Gastro",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Dortmunds Gastro-Szene bewegt sich",
        body: "2026 entstehen in Dortmund mehrere neue Konzepte. Besonders Kreuzviertel und Innenstadt bleiben wichtige Bereiche, gleichzeitig entstehen auch außerhalb der klassischen Gastro-Lagen neue Ideen.",
      },
      {
        heading: "Was derzeit auffällt",
        body: "Neue Konzepte setzen häufiger auf klare Spezialisierung: Pizza, Sandwiches, internationale Küche, Cafés mit Erlebnisfaktor oder moderne Take-away-Ideen. Auch die Dortmunder Wirtschaftsförderung unterstützt neue Gastro-Gründungen über Programme wie Geschmackstalente.",
      },
      {
        heading: "Pastera plant Dortmund",
        body: "Auch Pastera plant einen Standort in Dortmund. Das genaue Eröffnungsdatum und die Adresse werden erst veröffentlicht, wenn sie final bestätigt sind. Inhaltlich soll die Marke für moderne Pasta, Saucen, Toppings und vegane Optionen stehen.",
      },
      {
        heading: "Aktuell bleiben",
        body: "Bei angekündigten Neueröffnungen können Termine variieren. Deshalb lohnt es sich, kurz vor einem Besuch die offiziellen Kanäle der Restaurants zu prüfen.",
      },
    ],
  },
  {
    slug: "pastera-dortmund",
    title:
      "Pastera kommt nach Dortmund: Was bisher über den neuen Standort feststeht",
    seoTitle: "Pastera Dortmund",
    description:
      "Pastera Dortmund ist geplant. Was bisher feststeht und welche Pasta-Idee aus Köln nach Dortmund kommen soll.",
    city: "Dortmund",
    keywords: [
      "Pastera Dortmund",
      "Pasta Dortmund neu",
      "neues Restaurant Dortmund",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Ein neuer Pastera-Standort ist geplant",
        body: "Nach dem Start in Köln-Ehrenfeld plant Pastera die Expansion nach Dortmund. Damit soll das Pasta-Konzept künftig auch im Ruhrgebiet verfügbar sein.",
      },
      {
        heading: "Was bereits feststeht",
        body: "Im Mittelpunkt bleibt die Idee, Pasta mit verschiedenen Saucen und Toppings zu kombinieren. Vegane Optionen gehören zum Konzept. Eine konkrete Dortmunder Adresse oder ein verbindliches Eröffnungsdatum kommunizieren wir erst, sobald diese Informationen final sind.",
      },
      {
        heading: "Warum Dortmund spannend ist",
        body: "Dortmund hat eine aktive Gastro-Szene und eine große Zielgruppe für unkomplizierte, moderne Restaurantkonzepte. Neue Konzepte entstehen sowohl in der City als auch in Vierteln wie dem Kreuzviertel.",
      },
      {
        heading: "Updates",
        body: "Neue Informationen zur Eröffnung veröffentlichen wir hier und über die offiziellen Social-Media-Kanäle von Pastera. So vermeiden wir widersprüchliche Termine oder vorläufige Adressen.",
      },
    ],
  },
  {
    slug: "pasta-dortmund",
    title:
      "Pasta in Dortmund: Worauf du bei modernen Pasta-Restaurants achten kannst",
    seoTitle: "Pasta Dortmund",
    description:
      "Pasta in Dortmund: Guide zu modernen Pasta-Konzepten, Saucen, Toppings und veganen Optionen.",
    city: "Dortmund",
    keywords: [
      "Pasta Dortmund",
      "Pasta Restaurant Dortmund",
      "frische Pasta Dortmund",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Pasta als eigenes Restaurantkonzept",
        body: "Pasta wird zunehmend als eigenständiges Fast-Casual- oder Casual-Dining-Konzept gedacht. Statt einer riesigen italienischen Karte konzentrieren sich solche Restaurants auf Nudeln, Saucen und Toppings.",
      },
      {
        heading: "Was ein gutes Pasta-Konzept ausmacht",
        body: "Eine klare Auswahl ist wichtiger als möglichst viele Zutaten. Gute Kombinationen, transparente vegane Optionen und unterschiedliche Geschmacksprofile helfen bei der Entscheidung.",
      },
      {
        heading: "Pastera plant Dortmund",
        body: "Pastera möchte das in Köln gestartete Konzept auch nach Dortmund bringen. Details zum Standort folgen nach finaler Bestätigung.",
      },
      {
        heading: "Bis dahin",
        body: "Wer Pasta in Dortmund sucht, kann gezielt nach spezialisierten Pasta- oder Nudelkonzepten suchen und dabei Bewertungen nicht nur nach Sternen, sondern auch nach Aktualität und konkreten Gerichten lesen.",
      },
    ],
  },
  {
    slug: "vegan-essen-dortmund",
    title:
      "Vegan essen in Dortmund: So findest du Restaurants mit echter Auswahl",
    seoTitle: "Vegan essen Dortmund",
    description:
      "Vegan essen in Dortmund: Tipps für Restaurants mit mehr als einer veganen Option – von Pasta bis internationale Küche.",
    city: "Dortmund",
    keywords: [
      "vegan essen Dortmund",
      "vegan Restaurant Dortmund",
      "vegane Pasta Dortmund",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Mehr als eine Notlösung",
        body: "Ein gutes veganes Angebot besteht nicht nur aus dem Weglassen von Käse oder Fleisch. Spannender sind Restaurants, die vegane Gerichte bewusst entwickeln oder Komponenten flexibel kombinieren lassen.",
      },
      {
        heading: "Worauf du achten kannst",
        body: "Achte auf klare Kennzeichnung, vegane Saucen, pflanzliche Proteine und mehrere Optionen. Bei Pasta ist wichtig, ob auch die Nudeln selbst ohne Ei hergestellt werden.",
      },
      {
        heading: "Dortmund hat wachsende Auswahl",
        body: "Die Dortmunder Gastro-Szene wird internationaler und vielfältiger. Neue Konzepte bringen regelmäßig weitere vegane Möglichkeiten in die Stadt.",
      },
      {
        heading: "Pastera Dortmund",
        body: "Beim geplanten Pastera-Standort sollen vegane Optionen wie im Kölner Konzept Bestandteil des Menüs sein. Konkrete Standortdetails folgen später.",
      },
    ],
  },
  {
    slug: "restaurants-dortmund-guide",
    title: "Restaurants in Dortmund: Ein Guide nach Viertel, Anlass und Küche",
    seoTitle: "Restaurants Dortmund",
    description:
      "Restaurants in Dortmund finden: Guide nach Innenstadt, Kreuzviertel, Anlass und Küche.",
    city: "Dortmund",
    keywords: [
      "Restaurants Dortmund",
      "beste Restaurants Dortmund",
      "Essen gehen Dortmund",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Nicht nur nach „beste Restaurants“ suchen",
        body: "Die beste Adresse hängt davon ab, was du suchst: schnell essen, Date, große Gruppe, vegan, Pasta oder ein langer Abend. Mit Anlass plus Viertel findest du meist passendere Ergebnisse als mit einer pauschalen Bestenliste.",
      },
      {
        heading: "Innenstadt",
        body: "Die City ist praktisch, wenn du Shopping, Veranstaltung oder Bahnhof mit einem Restaurantbesuch kombinieren willst. Die Auswahl reicht von schnellen Konzepten bis zu größeren Restaurants.",
      },
      {
        heading: "Kreuzviertel",
        body: "Das Kreuzviertel ist für Cafés, Bars und kleinere Gastro-Konzepte bekannt. 2026 entstehen dort erneut neue Ideen, was das Viertel besonders für Food-Touren interessant macht.",
      },
      {
        heading: "Neue Konzepte beobachten",
        body: "Dortmund fördert Gastronomie-Gründungen aktiv. Deshalb lohnt sich auch der Blick auf Neueröffnungen – darunter künftig der geplante Pastera-Standort.",
      },
    ],
  },
  {
    slug: "essen-gehen-dortmund-2026",
    title: "Essen gehen in Dortmund 2026: Food-Trends und neue Konzepte",
    seoTitle: "Essen gehen Dortmund 2026",
    description:
      "Essen gehen Dortmund 2026: neue Gastro-Konzepte, Food-Trends und Tipps für die Restaurantwahl.",
    city: "Dortmund",
    keywords: [
      "Essen gehen Dortmund",
      "Dortmund Food Spots",
      "Dortmund Restaurants 2026",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Spezialisierte Konzepte",
        body: "Ein sichtbarer Trend sind Restaurants, die sich auf wenige Dinge konzentrieren und diese klar kommunizieren: Pizza, Nudeln, Sandwiches, Dumplings oder einzelne Länderküchen.",
      },
      {
        heading: "Erlebnis und Community",
        body: "Gastronomie wird stärker mit Erlebnis verbunden. Konzepte mit Events, Community oder ungewöhnlicher Nutzung entstehen neben klassischen Restaurants.",
      },
      {
        heading: "Vegane Optionen als Standard",
        body: "Bei neuen Restaurants sind vegetarische und vegane Optionen immer häufiger Teil des Grundkonzepts statt Zusatz. Für Gruppen macht das die Auswahl leichter.",
      },
      {
        heading: "Pasta als nächster Baustein",
        body: "Mit dem geplanten Pastera-Standort soll auch ein spezialisiertes modernes Pasta-Konzept nach Dortmund kommen. Details werden veröffentlicht, sobald sie final sind.",
      },
    ],
  },
  {
    slug: "koeln-vs-dortmund-food",
    title: "Köln oder Dortmund: Wie sich die Food-Szenen unterscheiden",
    seoTitle: "Köln vs Dortmund Food",
    description:
      "Köln und Dortmund kulinarisch: Unterschiede zwischen Veedeln, Ruhrgebiet, Neueröffnungen und Food-Konzepten.",
    city: "Guide",
    keywords: ["Köln Restaurants", "Dortmund Restaurants", "Food Szene NRW"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Zwei Städte, unterschiedliche Dynamik",
        body: "Köln lebt stark über seine Veedel. Gastro wird oft mit Vierteln wie Ehrenfeld, Südstadt oder Belgischem Viertel verbunden. Dortmund konzentriert sich stärker auf City, Kreuzviertel und einzelne Quartiere.",
      },
      {
        heading: "Gemeinsamkeiten",
        body: "Beide Städte zeigen eine starke Nachfrage nach spezialisierten, unkomplizierten Konzepten und internationaler Küche. Vegane Optionen und Social-Media-Tauglichkeit werden für neue Marken wichtiger.",
      },
      {
        heading: "Pastera als Verbindung",
        body: "Pastera startete 2026 in Köln-Ehrenfeld und plant einen weiteren Standort in Dortmund. Damit verbindet die Marke zwei unterschiedliche, aber gastronomisch aktive NRW-Städte.",
      },
      {
        heading: "Was Gäste davon haben",
        body: "Mehr spezialisierte Konzepte bedeuten mehr Auswahl. Gleichzeitig wird es wichtiger, vor dem Besuch aktuelle Informationen zu Öffnungszeiten und Standorten direkt beim Restaurant zu prüfen.",
      },
    ],
  },
  {
    slug: "restaurant-neueroeffnung-tipps",
    title:
      "Restaurant-Neueröffnungen finden: So entdeckst du neue Food-Spots vor dem Hype",
    seoTitle: "Restaurant Neueröffnungen finden",
    description:
      "So findest du Restaurant-Neueröffnungen in Köln, Dortmund und anderen Städten frühzeitig.",
    city: "Guide",
    keywords: [
      "Restaurant Neueröffnung",
      "neue Restaurants",
      "Food Spots entdecken",
    ],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Lokale Medien",
        body: "Stadtportale und Lokalzeitungen führen häufig laufend aktualisierte Listen zu Neueröffnungen. Für Köln und Dortmund sind solche Übersichten besonders nützlich, weil sich die Gastro-Szene schnell verändert.",
      },
      {
        heading: "Social Media",
        body: "Instagram und TikTok zeigen Neueröffnungen oft vor klassischen Suchergebnissen. Achte aber auf das Veröffentlichungsdatum: Ein virales Video kann Wochen später noch ausgespielt werden.",
      },
      {
        heading: "Google Maps",
        body: "Neue Einträge und aktuelle Rezensionen sind ein guter Hinweis darauf, ob ein angekündigtes Restaurant tatsächlich geöffnet hat.",
      },
      {
        heading: "Direkte Kanäle",
        body: "Für konkrete Öffnungszeiten, Adresse und Reservierung sind Website und offizielles Social-Media-Profil am zuverlässigsten. Bei Pastera veröffentlichen wir bestätigte Standortinformationen bewusst erst dann, wenn sie final sind.",
      },
    ],
  },
  {
    slug: "pastera-social-media",
    title: "Pastera auf Instagram: Pasta-Momente, neue Standorte und Updates",
    seoTitle: "Pastera Instagram",
    description:
      "Pastera auf Instagram: Wo du neue Pasta-Gerichte, Restaurant-Updates und Standort-News findest.",
    city: "Pastera",
    keywords: ["Pastera Instagram", "pastera official", "Pastera Reels"],
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Mehr als eine Speisekarte",
        body: "Social Media zeigt ein Restaurant anders als eine klassische Menüseite: Gerichte in Bewegung, Reaktionen, Aktionen und Eindrücke aus dem Alltag. Für Food-Konzepte ist das besonders hilfreich.",
      },
      {
        heading: "Pastera auf Instagram",
        body: "Der offizielle Account ist @pastera.official. Dort werden Pasta-Momente, Produkte und Neuigkeiten rund um die Marke geteilt.",
      },
      {
        heading: "Neue Standorte",
        body: "Auch Updates zum geplanten Dortmund-Standort sollen über die offiziellen Kanäle kommuniziert werden. So lassen sich vorläufige Informationen von bestätigten News unterscheiden.",
      },
      {
        heading: "Website und Social verbinden",
        body: "Auf pastera.de bündeln wir dauerhafte Informationen wie Menü, Standort und Guides. Social Media bleibt der schnellere Kanal für neue Eindrücke und kurzfristige Updates.",
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
