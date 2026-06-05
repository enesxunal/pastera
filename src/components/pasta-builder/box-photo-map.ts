import { menuPhotoForId } from "@/lib/menu-photo-map";

const PASTA_PHOTO: Record<string, string> = {
  "noodle-classic": menuPhotoForId("pasta-klassisch"),
  "noodle-vegan": menuPhotoForId("pasta-vegan"),
  "noodle-black": menuPhotoForId("pasta-klassisch"),
  "noodle-chocolate": menuPhotoForId("pasta-klassisch"),
};

const SAUCE_PHOTO: Record<string, string> = {
  "s-domates-vegan": menuPhotoForId("s-vegane-tomatensauce"),
  "s-bolognese": menuPhotoForId("s-bolognese"),
  "s-curry": menuPhotoForId("s-currysauce"),
  "s-krema": menuPhotoForId("s-sahnesauce"),
  "s-pesto": menuPhotoForId("s-veganes-pesto"),
  "s-arrabbiata": menuPhotoForId("s-arrabbiata"),
};

const TOPPING_PHOTO: Record<string, string> = {
  "t-julienne-rind": menuPhotoForId("sp-rind-mariniert"),
  "t-julienne-haehnchen": menuPhotoForId("sp-haehnchen-mariniert"),
  "t-jumbo-garnelen": menuPhotoForId("sp-schwarze-garnelen"),
  "t-tenders": menuPhotoForId("sp-haehnchen-mariniert"),
  "t-tofu": menuPhotoForId("sp-tofu"),
  "t-seitan": menuPhotoForId("sp-seitan"),
  "t-cherry": menuPhotoForId("t-cherrytomaten"),
  "t-babyspinat": menuPhotoForId("t-blattspinat"),
  "t-mantar": menuPhotoForId("t-champignons"),
  "t-rucola": menuPhotoForId("t-rucola"),
  "t-brokkoli": menuPhotoForId("t-brokkoli"),
  "t-mais": menuPhotoForId("t-mais"),
  "t-siyah-zeytin": menuPhotoForId("t-gruene-oliven"),
  "t-yesil-zeytin": menuPhotoForId("t-gruene-oliven"),
  "t-kurutulmus-sogan": menuPhotoForId("t-roestzwiebeln"),
  "t-jalapeno": menuPhotoForId("t-jalapenos"),
  "t-mozzarella": menuPhotoForId("t-mini-mozzarella"),
  "t-taze-sogan": menuPhotoForId("t-fruehlingszwiebeln"),
};

export function pastaPhotoForBox(pastaId?: string): string {
  return PASTA_PHOTO[pastaId ?? "noodle-classic"] || menuPhotoForId("pasta-klassisch");
}

export function saucePhotoForBox(id: string): string {
  return SAUCE_PHOTO[id] ?? "";
}

export function toppingPhotoForBox(id: string, fallbackImage?: string): string {
  return TOPPING_PHOTO[id] ?? fallbackImage ?? "";
}
