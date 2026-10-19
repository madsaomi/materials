export interface Unit {
  n:string; title:string; goal:string; words:[string,string,string][];
  recall:string; recallKey:string; scene:string; dialogue:string; translation:string;
  questions:string[]; answers:string[]; roleplay:string;
  card:string; tasks:string[]; solutions:string[]; retry:string;
}
export const units:Unit[]=[
{
  n:"01",title:"Знакомство в учебной группе",
  goal:"Представиться, спросить имя и происхождение; отличить профессию от текущего места.",
  words:[
    ["Hello!","Здравствуйте! / Привет!","Hello! My name is Nora."],
    ["My name is …","Меня зовут…","My name is Sam."],
    ["I'm …","Я…; сокращение I am","I'm a student."],
    ["Nice to meet you.","Приятно познакомиться.","Nice to meet you, Sam."],
    ["be from","быть родом из","Nora is from Leeds."],
    ["a student","студент; учащийся","Nora is a student."],
    ["an art teacher","преподаватель изобразительного искусства","Sam is an art teacher."],
    ["in the same class","в одной группе","We are in the same class."],
    ["at work","на работе","We aren't at work now."],
    ["in a classroom","в учебном классе","We are in a classroom."]
  ],
  recall:"Закройте правые столбцы. Скажите: 1) «Меня зовут Сэм»; 2) «Нора из Лидса»; 3) «Мы сейчас не на работе». Объясните разные артикли в a student / an art teacher.",
  recallKey:"My name is Sam. Nora is from Leeds. We aren't at work now. / We are not at work now. Student начинается с согласного звука /s/, art — с гласного. Полная и сокращённая формы be передают тот же факт.",
  scene:"Нора и Сэм впервые встречаются в учебном классе. Это отдельная вымышленная сцена, её факты не заменяют сведения чтения про Еву и Бена.",
  dialogue:"**Nora:** Hello! My name is Nora. What's your name?\n\n**Sam:** I'm Sam. Nice to meet you.\n\n**Nora:** Nice to meet you too. Are you from Leeds?\n\n**Sam:** No, I'm not. I'm from Tashkent. And you?\n\n**Nora:** I'm from Leeds. I'm a student. Are you a teacher?\n\n**Sam:** Yes, I am. I'm an art teacher. We're in the same English class.\n\n**Nora:** Are we at work now?\n\n**Sam:** No, we aren't. We're in a classroom!",
  translation:"Нора представляется и спрашивает имя. Сэм представляется и говорит, что рад знакомству. Нора отвечает и спрашивает, из Лидса ли он. Сэм отвечает: нет, из Ташкента, и задаёт встречный вопрос. Нора из Лидса и учится; она спрашивает, преподаватель ли Сэм. Он подтверждает, что преподаёт изобразительное искусство, и отмечает, что они в одной группе английского. Сейчас они не на работе, а в учебном классе.",
  questions:["Кто из Лидса, а кто из Ташкента?","Доказывает ли профессия Сэма, что сейчас он на работе?","Найдите три коротких ответа с be."],
  answers:["Nora is from Leeds; Sam is from Tashkent. Вопрос о Лидсе не равен положительному ответу Сэма.","Нет: We're in a classroom. Профессия и место сейчас — разные сведения.","No, I'm not; Yes, I am; No, we aren't. Отвечающий говорит о себе через I и об обоих через we."],
  roleplay:"A — Лина, студентка из Баку. B — Омар, преподаватель из Риги. Оба сейчас в библиотеке, не на работе. Сыграйте знакомство: имя, происхождение, занятие, текущее место. Критерий: четыре факта и хотя бы один верный короткий ответ. Возраст придумывать не нужно.",
  card:"Rosa is a nurse. She is from Riga. Amir is a student. He is from Baku. They are in a classroom now. Their ages are not given.",
  tasks:[
    "Вставьте am/is/are: Rosa ___ a nurse.",
    "Сохраните число: Rosa and Amir ___ in a classroom.",
    "Составьте вопрос: ___ Amir from Baku?",
    "Ответьте от лица Амира на Are you a student? короткой положительной фразой.",
    "Запишите отрицание Rosa is from Baku, сохранив имя и место.",
    "Запишите выражение «медсестра / медбрат» с артиклем: ___ nurse.",
    "Можно ли определить возраст Розы? Объясните по карточке.",
    "Представьте Амира двумя предложениями: занятие и происхождение."
  ],
  solutions:[
    "is: Rosa — единственное число.","are: подлежащее — два человека.","Is Amir from Baku? С be не добавляем do.",
    "Yes, I am. Отвечаем от лица Амира; Yes, he is не выполняет это указание.",
    "Rosa is not from Baku. / Rosa isn't from Baku. Отрицание, не вопрос.",
    "a nurse: перед согласным звуком /n/ — a.",
    "Нет. Their ages are not given; отсутствие возраста не сообщает, что Роза молода или старше Амира.",
    "Amir is a student. He is from Baku. Допустимо повторить Amir. Засчитываются оба факта и верные формы be."
  ],
  retry:"1–5: be и короткие ответы;6: слово с артиклем;7–8: сохранение фактов. Через день повторите трудные пункты с другими именами."
},
{
  n:"02",title:"Рабочий день и выходной",
  goal:"Рассказать о повторяющихся действиях и спросить о расписании, не смешивая does и окончание -s.",
  words:[
    ["work in a bookshop","работать в книжном магазине","Mila works in a bookshop."],
    ["on workdays","в рабочие дни","On workdays, she opens the shop at nine."],
    ["open the shop","открывать магазин","I open the shop at nine."],
    ["read the orders","читать заказы","She reads the orders."],
    ["make tea","готовить чай","We make tea in the morning."],
    ["have lunch","обедать","I have lunch at one."],
    ["finish work","заканчивать работу","I finish work at five."],
    ["on Sundays","по воскресеньям","I don't work on Sundays."],
    ["walk in the park","гулять в парке","Mila walks in the park."],
    ["at home","дома","She reads at home."]
  ],
  recall:"От лица Милы: 1) «Я открываю магазин в девять»; 2) «Я обедаю в час»; 3) «Я не работаю по воскресеньям». Перескажите первое предложение о ней через she.",
  recallKey:"I open the shop at nine. I have lunch at one. I don't work on Sundays. О ней: She opens the shop at nine. Не переносите -s в I open или после don't/doesn't.",
  scene:"Люси уточняет обычное расписание Милы. Речь о повторяющихся действиях, а не о том, что происходит в момент разговора.",
  dialogue:"**Lucy:** What time do you open the shop on workdays?\n\n**Mila:** I open it at nine.\n\n**Lucy:** What do you do first?\n\n**Mila:** I read the orders and make tea.\n\n**Lucy:** Do you have lunch at one?\n\n**Mila:** Yes, I do. I finish work at five.\n\n**Lucy:** Do you work on Sundays?\n\n**Mila:** No, I don't. I walk in the park and read at home.",
  translation:"Мила открывает магазин в рабочие дни в девять. Сначала читает заказы и готовит чай. Она обедает в час и заканчивает работу в пять. По воскресеньям не работает: гуляет в парке и читает дома.",
  questions:["Во сколько открывается магазин в рабочие дни и заканчивается работа Милы?","Какой день отличается от рабочего расписания?","Перескажите через she одно утверждение и одно отрицание Милы."],
  answers:["At nine; at five. Начало и конец не следует менять местами.","Sunday: she doesn't work on Sundays. О каждом другом дне ничего автоматически не выводим.","She reads the orders. She doesn't work on Sundays. После doesn't — work без -s."],
  roleplay:"A — новый коллега. B — сотрудник вымышленного магазина: открывает в десять, обедает в два, не работает по понедельникам. A узнаёт эти три факта и пересказывает через he/she. Проверка: сохранены время/день, после does/doesn't нет второго -s.",
  card:"Tim works in a library. On workdays, he opens it at ten and finishes work at six. He does not work on Sundays. On Sundays, he walks by the river.",
  tasks:[
    "Выберите: On workdays, Tim open / opens the library at ten.",
    "Дополните: What time ___ Tim open the library?",
    "Выберите: He doesn't work / works on Sundays.",
    "Ответьте по карточке: Does Tim work on Sundays?",
    "Дополните: Tim finishes work ___ six (at/on).",
    "Исправьте одну форму: Does he opens the library at ten?",
    "Одним английским предложением напишите, что Тим делает по воскресеньям.",
    "Можно ли утверждать по карточке, что Тим обедает в час? Объясните."
  ],
  solutions:[
    "opens: Tim/he + -s.","does: вопрос о Tim/he; после does уже стоит open.",
    "work: после doesn't без -s.","No, he doesn't. / He doesn't work on Sundays.",
    "at six: время на часах.","Does he open the library at ten? Оставляем does, убираем -s.",
    "He walks by the river on Sundays. Другой порядок обстоятельства с тем же смыслом допустим.",
    "Нет: время обеда не дано. Нельзя переносить обед Милы из другого сюжета на Тима."
  ],
  retry:"1–4/6: He works / Does he work? / He doesn't work;5: at + время;7–8: сообщение текста и догадка."
},
{
  n:"03",title:"Сравнить две сумки",
  goal:"Спросить цену, сравнить размер и стоимость, объяснить выбор без недоказанного вывода о качестве.",
  words:[
    ["a bag","сумка","This bag is small."],
    ["small / smaller","маленький / меньше","The red bag is smaller."],
    ["big / bigger","большой / больше","The blue bag is bigger."],
    ["cheap / cheaper","дешёвый / дешевле","The red bag is cheaper."],
    ["expensive","дорогой","The blue bag is expensive."],
    ["more expensive than","дороже, чем","The blue bag is more expensive than the red one."],
    ["cost","стоить","It costs ten pounds."],
    ["a pound / pounds","фунт / фунты (здесь деньги)","The red bag costs ten pounds."],
    ["because","потому что","I like it because it is small."],
    ["I'll take it.","Я возьму это.","The small bag, please. I'll take it."]
  ],
  recall:"Скажите: 1) «Красная сумка дешевле синей»; 2) «Она стоит десять фунтов»; 3) «Мне нравится эта сумка, потому что она маленькая». Не добавляйте вывод о качестве.",
  recallKey:"The red bag is cheaper than the blue bag. It costs ten pounds. I like this bag because it is small. Cheaper сравнивает цену; для качества нужны отдельные сведения.",
  scene:"Том выбирает между двумя сумками: красная маленькая за 10 фунтов и синяя большая за 20. Цены относятся только к вымышленной сцене.",
  dialogue:"**Assistant:** Can I help you?\n\n**Tom:** Yes, please. How much is the red bag?\n\n**Assistant:** It's ten pounds. The blue bag is twenty pounds.\n\n**Tom:** Is the blue bag bigger?\n\n**Assistant:** Yes, it is. It's also more expensive.\n\n**Tom:** I like the red bag because it's small.\n\n**Assistant:** The red bag, then?\n\n**Tom:** Yes, please. I'll take it.",
  translation:"Продавец предлагает помощь. Красная сумка стоит десять фунтов, синяя — двадцать. Синяя больше и дороже. Том предпочитает красную, потому что она маленькая, и выбирает её.",
  questions:["Какую сумку выбирает Том и какую причину называет?","На сколько фунтов различаются цены?","Есть ли подтверждение, что синяя сумка прочнее?"],
  answers:["Красную: because it's small. Нехватка денег Тома не названа.","На 10:20−10. Это разница, а не скидка.","Нет: размер и цена сообщены, прочность не описана."],
  roleplay:"Маленькая зелёная сумка стоит 15 фунтов, большая чёрная —25. Продавец знает цену и размер, но не материал. Покупатель спрашивает и выбирает любую с объяснением. На вопрос о материале допустимо I don't know; не придумывайте сведения о качестве.",
  card:"There are two bags: a small red bag for £10 and a big blue bag for £20. The label gives size and price. It says nothing about quality.",
  tasks:[
    "Напишите цену красной сумки словами по-английски.",
    "Дополните: The blue bag is ___ expensive than the red bag.",
    "По цене выберите: The red bag is cheaper / more expensive than the blue bag.",
    "Составьте вопрос о цене синей сумки через How much.",
    "Дополните сравнительную форму big: The blue bag is ___ than the red bag.",
    "Указывая на две сумки рядом, выберите: These is / are the bags.",
    "Доказывает ли карточка фразу The blue bag is better quality? Объясните.",
    "Выберите любую сумку: I like … because … . Причина должна опираться на цену или размер."
  ],
  solutions:[
    "ten pounds: pounds во множественном.","more: more expensive, не expensiver.","cheaper:10 меньше 20.",
    "How much is the blue bag? / How much does the blue bag cost?",
    "bigger: удваивается g.","are: these + множественное число.",
    "Нет: данных о качестве нет. Цена не заменяет отсутствующее сведение.",
    "Например: I like the red bag because it is small. / I like the blue bag because it is big. Нужны названная сумка, верный о ней факт и связь because; личный выбор не оценивается как неправильный."
  ],
  retry:"1/4: цена и вопрос;2/3/5: сравнения;6: число;7/8: факт и предпочтение. Повторите с новыми ценами."
},
{
  n:"04",title:"Семья, вещи и принадлежность",
  goal:"Назвать родственника и владельца вещи, различая her bike и the bike is hers.",
  words:[
    ["a sister","сестра","Mia is Leo's sister."],["a father","отец","They live with their father."],
    ["have / has","иметь; у кого-то есть","Leo has a blue bike."],["her bike","её велосипед","Her bike is green."],
    ["his bike","его велосипед","His bike is blue."],["mine / yours","мой / твой без следующего существительного","This bike is mine."],
    ["Whose …?","Чей / чья / чьи…?","Whose bike is this?"],["in the garden","в саду","Mia's bike is in the garden."],
    ["in the garage","в гараже","Leo's bike is in the garage."],["prefer walking","предпочитать ходить пешком","Their father prefers walking."]
  ],
  recall:"Скажите: 1) «Это её велосипед»; 2) «Этот велосипед мой»; 3) «Чей это велосипед?». Объясните, почему после her здесь есть существительное, а после mine — нет.",
  recallKey:"This is her bike. This bike is mine. Whose bike is this? Her стоит перед bike; mine заменяет my bike. Формы *mine bike и *bike is my этим конструкциям не подходят.",
  scene:"Лео и его сестра Мия собираются на прогулку. Зелёный велосипед Мии в саду, синий велосипед Лео в гараже. Владение и место — разные сведения.",
  dialogue:"**Mia:** Leo, is the blue bike yours?\n\n**Leo:** Yes, it is. It's in the garage.\n\n**Mia:** Where is my green bike?\n\n**Leo:** It's in the garden.\n\n**Mia:** Does Dad like cycling?\n\n**Leo:** He prefers walking.\n\n**Mia:** Let's go to the park together on Saturday.\n\n**Leo:** Good idea! Dad can walk, and we can cycle.",
  translation:"Мия спрашивает, Лео ли принадлежит синий велосипед. Он подтверждает: велосипед в гараже. Зелёный велосипед Мии в саду. Отец предпочитает ходить пешком. Мия предлагает вместе пойти в парк в субботу; Лео предлагает отцу идти пешком, а им ехать на велосипедах. Это план, не уже состоявшаяся прогулка.",
  questions:["Кому принадлежат велосипеды и где они находятся?","Доказывает ли prefers walking, что отец ненавидит велосипеды?","Побывали ли герои уже в парке в этой сцене?"],
  answers:["Зелёный — Мии, в саду; синий — Лео, в гараже.","Нет: предпочтение не сообщает ненависть к другому занятию.","Нет: Let's go — предложение; Good idea выражает согласие, не завершение прогулки."],
  roleplay:"Сара: её красная сумка у двери. Её брат Омар: его чёрная сумка на стуле. Спросите владельца и место через my/your и mine/yours. Перескажите сведения партнёра через his/her. Проверка: оба владельца и места сохранены, определение не смешано с самостоятельным местоимением.",
  card:"Mia has a green bike. Her bike is in the garden. Her brother Leo has a blue bike in the garage. Their father prefers walking. The card does not say whether he owns a bike.",
  tasks:[
    "Выберите: Mia have / has a green bike.",
    "По Мии: This is her / hers bike.",
    "По Мии: The green bike is her / hers.",
    "Составьте вопрос о владельце синего велосипеда через Whose.",
    "Запишите Mia + 's + bike без пробелов внутри притяжательной формы.",
    "Исправьте вопрос, сохранив have: Does Leo has a bike?",
    "Следует ли из карточки, что у отца нет велосипеда? Объясните.",
    "Одним английским предложением назовите цвет и место велосипеда Лео с указанием владельца."
  ],
  solutions:[
    "has: Mia/she.","her: определение перед bike.","hers: самостоятельное местоимение.",
    "Whose blue bike is this? / Whose is the blue bike? Вопрос о владельце, не Where.",
    "Mia's bike. После имени добавлено 's.","Does Leo have a bike? После does — начальная форма have.",
    "Нет: владение не сообщено. Prefers walking описывает предпочтение, не отсутствие вещи.",
    "Leo's blue bike is in the garage. / Leo has a blue bike in the garage. Владелец, цвет и место должны сохраниться."
  ],
  retry:"1/6: have/has и does;2–5: принадлежность;7/8: факты. Повторите с двумя вымышленными предметами."
},
{
  n:"05",title:"Покупки по списку",
  goal:"Различить продукт, число предметов и упаковку; заказать нужное и заметить отсутствующий товар.",
  words:[
    ["an apple / two apples","яблоко / два яблока","I'd like two apples."],
    ["a loaf of bread","буханка хлеба","I need a loaf of bread."],
    ["some milk","молоко без точного количества","I need some milk."],
    ["a bottle of water","бутылка воды","Two bottles of water, please."],
    ["rice","рис как продукт","I don't need any rice."],
    ["a shopping list","список покупок","Bread is on my shopping list."],
    ["need","нуждаться; нужно","I need bread."],["buy","покупать","I buy two apples."],
    ["I'd like …, please.","Я хотел(а) бы…, пожалуйста.","I'd like a loaf of bread, please."],
    ["How many …? / How much …?","сколько: число / количество или цена","How many bottles? How much water? How much is it?"]
  ],
  recall:"Скажите: 1) «две бутылки воды»; 2) «буханка хлеба»; 3) «Мне не нужен рис». Задайте вопросы о числе бутылок и количестве воды. Не считайте любую бутылку литровой.",
  recallKey:"two bottles of water; a loaf of bread; I don't need any rice. How many bottles? — число упаковок; How much water? — количество воды. Без объёма каждой бутылки число литров не определяется.",
  scene:"Бен покупает продукты по списку. Цены и наличие заданы только для вымышленной сцены. Молока сегодня нет.",
  dialogue:"**Assistant:** Hello. Can I help you?\n\n**Ben:** I'd like two apples and a loaf of bread, please.\n\n**Assistant:** Two apples are two pounds. The bread is three pounds. Anything else?\n\n**Ben:** Have you got any milk?\n\n**Assistant:** No, we haven't got any milk today.\n\n**Ben:** Then two bottles of water, please. That's all.\n\n**Assistant:** The two bottles are two pounds together. That's seven pounds in total.\n\n**Ben:** Here you are. Thank you.",
  translation:"Бен просит два яблока и буханку хлеба. Два яблока вместе стоят 2 фунта, хлеб —3. Молока сегодня нет. Бен берёт две бутылки воды за 2 фунта вместе. Всего:2+3+2=7 фунтов. Вода куплена, молоко — нет; объём бутылок не указан.",
  questions:["Чего нет в магазине и что Бен берёт вместо этого?","Сколько стоят обе бутылки вместе, а сколько вся покупка?","Каковы число бутылок и объём воды в литрах?"],
  answers:["Молока нет; Бен выбирает две бутылки воды.","Бутылки вместе —2 фунта; всё —7. Не умножайте 2 ещё раз на число бутылок.","Две бутылки; число литров неизвестно, нужен объём каждой."],
  roleplay:"A — покупатель: нужны три яблока и хлеб; молоко по желанию. B — продавец: яблоки по 1 фунту, хлеб 2, молока нет, вода по 1 фунту за бутылку 0,5 л. Покупатель может отказаться от воды. Повторите заказ и пересчитайте только выбранные товары. Если важен объём воды, его надо уточнить.",
  card:"Receipt: two apples — £2; one loaf of bread — £3; two bottles of water — £2 together. Total: £7. No milk was bought. The bottle sizes are not given.",
  tasks:[
    "Выберите вопрос о числе яблок: How much / How many apples?",
    "Дополните: one loaf of bread / breads.",
    "Выберите: two bottle / bottles of water.",
    "Выберите по смыслу отсутствия: There isn't some / any milk in the bag.",
    "Вежливая просьба, ожидающая согласия: Could I have some / any tea, please? Выберите обычный вариант для этого смысла.",
    "Назовите общую стоимость чека по-английски.",
    "Доказывает ли чек покупку ровно двух литров воды? Объясните.",
    "Закажите два яблока и буханку хлеба одной вежливой английской репликой."
  ],
  solutions:[
    "How many apples? Считаем яблоки.","bread: продукт неисчисляем в этом значении, единицу задаёт loaf.",
    "bottles: two относится к бутылкам.","any: обычное отрицание отсутствия молока.",
    "some: обычная просьба в данном контексте. Вопросительная форма сама по себе не требует any.",
    "Seven pounds:2+3+2; цена воды уже дана за обе бутылки.",
    "Нет: число бутылок не сообщает их объём. Два литра требуют дополнительного условия.",
    "I'd like two apples and a loaf of bread, please. / Could I have two apples and a loaf of bread, please? Оцениваются вежливая просьба и оба точных количества; *two breads здесь не подходит."
  ],
  retry:"1–3/7: продукт и единица счёта;4–5: смысл some/any;6: сумма;8: точная просьба. В новой сцене измените число яблок и заново пересчитайте цену."
}
];
