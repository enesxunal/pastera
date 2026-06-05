-- Standart makarnalar: public/1x görselleri ve dosya adlarıyla eşleşen isimler
update catalog_items set
  name_de = 'Pera e Miele',
  name_tr = 'Pera e Miele',
  image = '/Pera e Miele.png',
  updated_at = now()
where id = 'std-pera-e-miel';

update catalog_items set
  name_de = 'Pasta Cremosa',
  name_tr = 'Pasta Cremosa',
  image = '/Pasta Cremosa.png',
  updated_at = now()
where id = 'std-kremali-tavuk';

update catalog_items set
  name_de = 'Pasta al Pomodoro',
  name_tr = 'Pasta al Pomodoro',
  image = '/Pasta al Pomodoro.png',
  updated_at = now()
where id = 'std-domates';

update catalog_items set
  name_de = 'Pasta al Pesto',
  name_tr = 'Pasta al Pesto',
  image = '/Pasta al Pesto.png',
  updated_at = now()
where id = 'std-pesto-mozzarella';

update catalog_items set
  name_de = 'Pasta Curry',
  name_tr = 'Pasta Curry',
  image = '/Pasta Curry.png',
  updated_at = now()
where id = 'std-curry-tavuk';

update catalog_items set
  name_de = 'Pasta Bolognese',
  name_tr = 'Pasta Bolognese',
  image = '/Pasta Bolognese.png',
  updated_at = now()
where id = 'std-bolognese';

update catalog_items set
  name_de = 'Manti',
  name_tr = 'Manti',
  image = '/Manti.png',
  updated_at = now()
where id = 'std-manti';
