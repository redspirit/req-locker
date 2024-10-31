# req-locker
Express middleware for caching and locking requests

Включает в себя 2 бибилиотеки: cache и locker.  

## Установка
```bash
npm i req-locker
```

## cache 
Обычное кеширование запросов в оперативной памяти сервера

Простейший пример:
```js
const { cache } = require('req-locker');

app.use(cache({
    overrideSend: true
}));
```

### Конфигурация:
Функция **cache(params)** принимает один объект с параметрами:
* `ttl`=60 - время жизни кеша в секундах
* `checkperiod`=5 - интервал проверки кеша в секундах
* `cacheKey` - функция определения ключа кеша по запросу, по-умолчанию берется MD5-хеш по url-запроса включая все его query и body, но пользователь может задать любой текстовый ключ, например кешировать только по одному query-параметру 
* `statusCode`=200 - каким HTTP-кодом нужно ответить если вернулось кешированое значение
* `overrideSend`=false - если этот параметр `true`, то библиотека перезапишет стандартный метод `res.send()` чтобы сохранить в кеше ответ на запрос. Если же значение `false`, то для сохранения кеша нужно возращать ответ на запрос с помощью нового метода `res.cachedSend()`

## locker
Эта middleware "удерживает" ретрай-запросы до тех пор, пока оригинальный запрос не вернет ответ.

### Для чего это нужно?
Представьте ситуацию, что у вас есть высоконагруженный запрос на сервере, который расчитывает, например, тарифы на услугу, он учитывает множество параметров
и в обычном варианте он отвечает за 2 секунды. В пиковые моменты нагрузки отклик значительно возрастает, например, до 8-10 секунд.
Если запрос нужно ждать так долго, то пользователи могут воспринять это как ошибку но попробовать вызвать запрос снова (все зависит от реализации клиентской стороны)
или внешняя интеграция может вызывать ваш метод и делать ретрай запроса при большом таймауте. В этом случае и так перенагруженный сервис получает дополнительные ретрай-запросы
которые еще больше вызывают нагрузку (в этом случае кеш не поможет, так как "первый" запрос еще не получил данные для кеширования).
Получается эффект снежного кома, чем дольше отвечает сервер, тем больше получает ретраев и еще сильней нагружается вплоть до отказа.

**locker** - это простой механизм, который просто находит ретрай-запросы по ключу (аналогично ключу кеша) и удерживает их коннект до тех пор, пока
оригинальный запрос не получит данные для ответа. В этот момент сервер ответит и оригинальному запросу и всем ретраям одновременно одинаковым ответом.
При этом запросы-ретраи **не будут** понапрасну загружать сервер предотвращая эффект снежного кома. 
 
Если вы столкнулись с подобной проблемой в моменты пиковой нагрузки, то locker, возможно, сможет вам помочь.

Простейший пример:
```js
const { locker } = require('req-locker');

app.use(locker());
```

### Конфигурация:
Функция **locker(params)** принимает один объект с параметрами:
* `reqKey` - функция определения ключа запроса, аналогично `cacheKey`
* `statusCode`=200
