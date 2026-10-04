export const SITE_URL = "https://www.pastera.de";

export const PASTERA_BUSINESS = {
  name: "Pastera",
  legalName: "Pastera – Frische Pasta",
  description:
    "Pastera ist ein Pasta-Restaurant in Köln-Ehrenfeld mit frisch zubereiteten Pasta-Gerichten, verschiedenen Saucen, Toppings und veganen Optionen.",
  streetAddress: "Venloer Straße 342",
  postalCode: "50823",
  addressLocality: "Köln",
  addressRegion: "Nordrhein-Westfalen",
  addressCountry: "DE",
  telephone: "+49 163 4566354",
  priceRange: "€€",
  instagram: "https://www.instagram.com/pastera.official/",
  facebook: "https://www.facebook.com/pastera.official",
  tiktok: "https://www.tiktok.com/@pastera.official",
  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "11:00",
      closes: "01:00",
    },
    { days: ["Friday", "Saturday"], opens: "11:00", closes: "04:00" },
    { days: ["Sunday"], opens: "12:00", closes: "01:00" },
  ],
} as const;
