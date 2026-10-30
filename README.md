# Загрузчик страниц (JS)

[![hexlet-check](https://github.com/AlexAirCG/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/AlexAirCG/fullstack-javascript-project-4/actions)

На базовом уровне научитесь работать с асинхронным кодом в JavaScript, писать тесты на Mock / Stub, работать с ошибками и исключениями, DOM, promises, async / await, работать с HTTP.

Учебный проект Хекслета: https://ru.hexlet.io/programs/fullstack-javascript
Как это должно работать: https://asciinema.org/a/dVKok25V5xW2SkjMF4LE8fZOw

## Стек

- JavaScript

## Установка

```bash
git clone https://github.com/AlexAirCG/fullstack-javascript-project-4.git
cd fullstack-javascript-project-4
make install
npm link
```

## Использование

```bash
page-loader [--output <dir>] <url>
```

По умолчанию файл сохраняется в текущую директорию. Команда выводит полный путь к сохранённому файлу.

```bash
page-loader --output /tmp https://ru.hexlet.io/courses
# /tmp/ru-hexlet-io-courses.html
```

[![asciicast](https://asciinema.org/a/v0FuB2S5MMPqMEoT.svg)](https://asciinema.org/a/v0FuB2S5MMPqMEoT)

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
