export type Correction = {unit:string;part:string;before:string;after:string};
export const corrections:Correction[]=[];
export function fix(unit:string,part:string,text:string):string {
  const rep=(a:string,b:string)=>{
    if(!text.includes(a)) throw Error("Missing expected text: "+unit+"/"+part+" "+a.slice(0,90));
    text=text.replaceAll(a,b);corrections.push({unit,part,before:a,after:b});
  };
  if(part==="test") {
    if(unit==="01") {
      rep('9. I am ___ Moscow. A) in B) from C) at','9. I am ___ Moscow. (родом из Москвы) A) in B) from C) at');
      rep('24. Какая интонация у вопроса "Are you a student?"','24. В типовой учебной модели нейтрального общего вопроса какая интонация у "Are you a student?"');
      rep('25. Какая интонация у вопроса "What\'s your name?"','25. В типовой учебной модели нейтрального специального вопроса какая интонация у "What\'s your name?"');
      rep('Звуки усвоены. Переходи к чтению вслух текстов и скороговоркам.','Высокий результат этих письменных заданий. Он не проверяет слух и произношение; для них нужна отдельная работа с образцом и обратной связью.');
      text+='\nПункты24–25 показывают распространённую учебную модель, а не неизменную интонацию любой реплики. Контекст и отношение говорящего могут менять тон.\n';
    }
    if(unit==="02") {
      for(const [a,b]of [
        ['16. Я ем завтрак. — I eat breakfast.','16. Я ем завтрак. (обычно; Present Simple) → __________'],
        ['17. Она читает книгу. — She reads a book.','17. Она читает книгу. (обычное действие; Present Simple) → __________'],
        ['18. Мы играем в футбол. — We play football.','18. Мы играем в футбол. (обычно; Present Simple) → __________'],
        ['19. Он вчера ходил в школу. — He went to school yesterday.','19. Он вчера ходил в школу. → __________'],
        ['20. Они смотрели фильм. — They watched a movie.','20. Они смотрели фильм. (законченный вчерашний эпизод; Past Simple) → __________'],
        ['37. This is ___ book. A) a B) an C) the','37. This is ___ book. (одна книга впервые вводится; выберите неопределённый артикль) A) a B) an C) the'],
        ['38. She is ___ engineer. A) a B) an C) the','38. She is ___ engineer. (называем профессию; нужен неопределённый артикль) A) a B) an C) the'],
        ['42. person → ___ A) persons B) people C) peoples → B','42. person → ___ (обычное множественное число в значении «люди») A) persons B) people C) peoples → __________'],
        ['40. child → ___ A) childs B) children C) childrens → B','40. child → ___ A) childs B) children C) childrens → __________'],
        ['41. woman → ___ A) womans B) women C) womens → B','41. woman → ___ A) womans B) women C) womens → __________'],
        ['43. city → ___ A) citys B) cities C) cityes → B','43. city → ___ A) citys B) cities C) cityes → __________'],
        ['| 19 | B |','| 19 | (перевод) |'],
        ['| 20 | B |','| 20 | (перевод) |'],
        ['| 44 | A |','| 44 | Good morning! |'],
        ['| 45 | B |','| 45 | Nice to meet you! |'],
        ['Свободное владение темой блока','Высокий результат данного письменного банка; общий уровень владения по нему не определяется']
      ]) rep(a,b);
    }
    if(unit==="03") {
      rep('11. good → better → ___ → best','11. good → better → ___ (superlative) → __________');
      rep('12. bad → ___ → worse (comparative)','12. bad → ___ (comparative) → __________');
      rep('- **Часть 3: Irregular forms; задание 13.** better','- **Часть 3: Irregular forms; задание 11.** best\n- **Часть 3: Irregular forms; задание 12.** worse\n- **Часть 3: Irregular forms; задание 13.** better');
      rep('28. There is ___ bread in the cupboard. A) any B) no C) some','28. There is ___ bread in the cupboard. (хлеба совсем нет) A) any B) no C) some');
      rep('задание 72.** a (71→b: leather is кожа — b is кожа; please check note)','задание 72.** c (silk = шёлк)');
      rep('Уверенно усвоил тему','Высокий результат данного банка; это не определение уровня языка');
    }
    if(unit==="04") {
      rep('I am not married. I am ___.','I am not married or engaged and do not have a partner. In this exercise, I am ___.');
      rep('31. He lives in a ___ house. A) big old B) old big C) big old wooden','31. He lives in a ___ house. (выберите порядок только двух данных признаков: большой и старый) A) big old B) old big C) big old wooden');
      rep('**Часть 9:** 43-50 см. выше','**Часть 9:** 43–50 — примеры перевода находятся в закрытом ключе «Проверка самостоятельной работы» ниже. Допустимы эквивалентные варианты; для43–44 также have got / has got.');
      rep('Ты отлично знаешь тему «Семья и отношения»!','Высокий результат данного письменного банка; это не проверка всех навыков по теме.');
    }
    if(unit==="05") {
      text=text.replace('16. a ___ of tea','Выберите по смыслу указанную упаковку/посуду:16 чашка,17 бутылка,18 миска,19 ломтик,20 пакет. Без этих уточнений возможны разные сочетания.\n\n16. a ___ of tea');
      rep('Ты отлично освоил тему «Еда и напитки».','Высокий результат данного письменного банка; это не подтверждение всех навыков по теме.');
    }
  }
  if(part==="dialogue") {
    if(unit==="01") {
      rep("Then this is the right table for us. They're thirteen minutes late now.","Then this is the right table for us. Our two other friends are thirteen minutes late now.");
      rep("It's so different without glasses.","She looks so different without glasses.");
      rep("Hmm, sure. The weather is warm, but the water in the pool is cool.","Maybe. On warm days, the water in that pool can still be cool.");
      rep('/ʃʊə/ /wɔːm/ /puːl/ /kuːl/', '/ˈmeɪbi/ /wɔːm/ /puːl/ /kuːl/');
    }
    if(unit==="04") {
      rep('**Mike:** Hi, Anna! Nice to meet you!','**Mike:** Hello, Mrs Green! Nice to meet you!');
      rep('**Майк:** Привет, Анна! Приятно познакомиться!','**Майк:** Здравствуйте, миссис Грин! Приятно познакомиться!');
    }
    if(unit==="05") {
      rep('Would you like to pay by card or cash?','Would you like to pay by card or in cash?');
      rep('**by card or cash** — картой или наличными (какой ценой/способом — предлог by).','**by card or in cash** — картой или наличными; предлог в двух сочетаниях различается.');
      rep('Сначала вскипяти спагетти.','Сначала отвари спагетти.');
    }
  }
  if(part==="vocabulary/words") {
    if(unit==="01") rep('это лучший способ «настроить» ухо.','это упражнение на сравнение форм. Для проверки слухового различения и произношения нужен звуковой образец и обратная связь.');
    if(unit==="05") {
      rep('A heavy dinner before bed is bad.','It was a heavy dinner.');
      rep('Fizzy drinks are full of sugar.','This fizzy drink has no sugar.');
    }
  }
  return text;
}
