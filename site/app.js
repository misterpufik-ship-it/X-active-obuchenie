const baseMaterials = [
  {
    id: "ozon-supply-fbo",
    topic: "Поставки Ozon",
    title: "Поставка на Ozon FBO через SelsUp",
    description:
      "Пошаговая инструкция по созданию заявки на поставку Ozon FBO: файл из SelsUp, выбор склада и точки сдачи, таймслот, данные автомобиля, короба, состав грузомест, сортируемый и несортируемый товар, печать этикеток.",
    role: "Склад / менеджер поставки",
    duration: "15-20 минут",
    sourceVideo: "./videos/ozon-supply.mp4",
    videoNote:
      "Исходное видео длится около 4 минут 25 секунд. Откройте его, если нужно сверить экраны Ozon, выбор склада Бугры, таймслот и заполнение коробов.",
    keywords: [
      "ozon",
      "озон",
      "fbo",
      "поставка ozon",
      "selsup",
      "селсап",
      "бугры",
      "кросс-док",
      "таймслот",
      "грузоместа",
      "короба",
      "сортируемый",
      "несортируемый",
      "этикетки",
      "состав короба",
      "заявка",
      "файл поставки",
      "инструкция"
    ],
    steps: [
      {
        title: "Подготовить файл поставки в SelsUp",
        why: "Ozon принимает заявку через загрузку файла. Без корректного файла из SelsUp заявка не соберётся с нужным составом товаров.",
        action:
          "В SelsUp сформируйте заказ на отгрузку на Ozon и выгрузите файл поставки. Затем в личном кабинете Ozon откройте раздел поставок FBO, нажмите «Создать заявку» → «Загрузить через файл» и выберите подготовленный файл. Проверьте, что в списке отображаются все товары и количества.",
        result: "Файл из SelsUp загружен в Ozon, состав поставки виден на экране.",
        image: "./assets/ozon_supply_01.png",
        caption: "Файл поставки из SelsUp загружается в заявку Ozon."
      },
      {
        title: "Выбрать склад и точку сдачи",
        why: "Нужно указать, куда физически привезут груз и через какой склад Ozon пойдёт поставка.",
        action:
          "Нажмите «Продолжить». Выберите кросс-докинговый склад и способ «Доставит Ozon». Для этого сценария — склад «Бугры». Перейдите на вкладку «Выбрать точку», найдите точку сдачи груза и подтвердите выбор.",
        result: "Склад «Бугры» и точка сдачи выбраны.",
        image: "./assets/ozon_supply_02.png",
        caption: "Выбор склада Бугры и точки сдачи груза."
      },
      {
        title: "Выбрать кластер и таймслот",
        why: "Ozon должен знать направление поставки и время, когда водитель привезёт короба на точку.",
        action:
          "Нажмите «Продолжить» и выберите кластер «Москва и дальние регионы» → «Софьино» (или тот, что указан в задаче). Укажите таймслот на день фактической отгрузки: выберите удобную дату и время, не раннее утро (6–7:00). Подтвердите слот и перейдите к созданию заявки.",
        result: "Кластер и адекватный таймслот выбраны и подтверждены.",
        image: "./assets/ozon_supply_03.png",
        caption: "Кластер, дата и время сдачи груза на точку."
      },
      {
        title: "Добавить данные автомобиля",
        why: "На складе Ozon сверяют, кто привезёт поставку. Данные должны совпасть с фактическим водителем.",
        action:
          "В блоке данных автомобиля выберите сохранённый профиль того, кто повезёт груз (например, Toyota для одного водителя или Mercedes для другого). Проверьте имя и номер, затем нажмите «Сохранить».",
        result: "Данные автомобиля и водителя сохранены в заявке.",
        image: "./assets/ozon_supply_04.png",
        caption: "Выбор сохранённого профиля автомобиля и водителя."
      },
      {
        title: "Указать количество коробов",
        why: "Количество грузомест в заявке должно совпасть с фактическим числом коробов, которые уедут на Ozon.",
        action:
          "В поле количества грузомест укажите реальное число коробов: 1, 2, 3 и т.д. Нажмите «Сгенерировать». Ozon создаст столько грузомест, сколько коробов вы указали.",
        result: "В заявке создано нужное количество грузомест под короба.",
        image: "./assets/ozon_supply_05.png",
        caption: "Количество грузомест равно количеству физических коробов."
      },
      {
        title: "Заполнить состав каждого короба",
        why: "Без состава Ozon не поймёт, какие товары лежат в каждом коробе, и может начислить лишнюю обработку.",
        action:
          "Для каждого короба нажмите «Указать состав». Добавьте товары и количества, которые физически лежат в этом коробе. Сохраните состав по каждому грузоместу отдельно.",
        result: "Состав заполнен для всех коробов, данные сохранены.",
        image: "./assets/ozon_supply_06.png",
        caption: "Распределение товаров по коробам в заявке Ozon."
      },
      {
        title: "Разделить сортируемый и несортируемый товар",
        why: "Смешивание типов грузомест увеличивает стоимость обработки. Несортируемый товар всегда кладут отдельно.",
        action:
          "Проверьте тип каждого грузоместа: «сортируемый» или «несортируемый». Сортируемые товары можно объединять в один или несколько коробов. Несортируемый товар положите в отдельный небольшой короб и оформите отдельным грузоместом.",
        result: "Типы грузомест указаны верно, лишняя плата за обработку исключена.",
        image: "./assets/ozon_supply_07.png",
        caption: "Сортируемые и несортируемые товары разделены по коробам."
      },
      {
        title: "Распечатать этикетки и передать водителю",
        why: "На каждый короб нужна своя этикетка с номером грузоместа. Перепутанные этикетки — частая причина проблем на приёмке.",
        action:
          "Скачайте и распечатайте этикетки Ozon. Наклейте этикетку №1 на короб №1, этикетку №2 на короб №2 и так далее. Передайте короба водителю вместе с датой и временным окном таймслота.",
        result: "Этикетки наклеены по номерам, водитель знает дату и время сдачи.",
        image: "./assets/ozon_supply_08.png",
        caption: "Печать этикеток и передача коробов водителю в согласованный таймслот."
      }
    ],
    checklist: [
      "Файл поставки загружен из SelsUp в Ozon, состав товаров совпадает.",
      "Выбран склад «Бугры» и корректная точка сдачи.",
      "Кластер и таймслот соответствуют фактической дате отгрузки.",
      "Данные автомобиля и водителя сохранены.",
      "Количество грузомест равно количеству коробов.",
      "Состав заполнен по каждому коробу отдельно.",
      "Несортируемый товар вынесен в отдельное грузоместо.",
      "Этикетки распечатаны и наклеены: короб 1 — этикетка 1, короб 2 — этикетка 2."
    ],
    issues: [
      {
        title: "Неверный таймслот",
        text: "Не выбирайте слишком раннее время (6–7 утра), если груз физически не успеют привезти. Лучше сдвинуть дату или слот на реально достижимое окно."
      },
      {
        title: "Смешали сортируемый и несортируемый товар",
        text: "Несортируемый товар всегда оформляйте отдельным коробом и отдельным грузоместом. Иначе Ozon может начислить дополнительную обработку."
      },
      {
        title: "Количество коробов не совпало",
        text: "Число грузомест в заявке должно равняться фактическому количеству коробов. Если короб добавили или убрали — пересоздайте или скорректируйте заявку."
      },
      {
        title: "Перепутаны этикетки",
        text: "Этикетка грузоместа №1 клеится только на короб №1. Номер на этикетке должен совпадать с фактическим содержимым короба."
      },
      {
        title: "Не заполнен состав короба",
        text: "Без состава Ozon не видит распределение товаров. Заполните «Указать состав» для каждого грузоместа и сохраните."
      }
    ]
  },
  {
    id: "wb-supply-selsup",
    topic: "Поставки WB",
    title: "Поставка на WB через SelsUp",
    description:
      "Полная инструкция по созданию поставки WB через SelsUp: загрузка файла, связка с номером WB, упаковка по коробам, печать штрихкодов, загрузка Excel обратно в WB, пропуск и оформление СДЭК.",
    role: "Склад / менеджер поставки",
    duration: "25-35 минут",
    sourceVideo: "./videos/wb-selsup-supply.mp4",
    videoNote:
      "Исходное видео длится около 8 минут 49 секунд. Откройте его, если нужно сверить движение по экранам SelsUp, WB и печать штрихкодов.",
    keywords: [
      "wb",
      "вб",
      "wildberries",
      "selsup",
      "селсап",
      "поставка",
      "поставка wb",
      "заказы на отгрузку",
      "создать из файла",
      "xls",
      "excel",
      "внешний номер",
      "упаковка",
      "шк коробов",
      "штрихкод короба",
      "штрихкод поставки",
      "короба",
      "палета",
      "пропуск",
      "сдэк",
      "транспортная компания",
      "инструкция"
    ],
    steps: [
      {
        title: "Выбрать файл поставки",
        why: "Поставка начинается с XLS-файла, который прислал менеджер. По нему SelsUp создаст заказ на отгрузку.",
        action:
          "В SelsUp откройте раздел «Заказы на отгрузку» или «Поставки на маркетплейс FBO», нажмите «Создать из файла» и в окне выбора найдите нужный XLS. Выберите именно файл поставки, а не файл со штрихкодами коробов. После выбора дождитесь полной загрузки и не переходите дальше, пока поставка не появилась в списке.",
        result: "Файл выбран, загрузка завершилась, в SelsUp появилась созданная поставка.",
        image: "./assets/wb_supply_01_file_upload.png",
        caption: "Выбор XLS-файла поставки для загрузки в SelsUp."
      },
      {
        title: "Проверить карточку поставки в SelsUp",
        why: "Перед связкой с WB нужно убедиться, что поставка создана в правильном месте и будет списываться с нужного склада.",
        action:
          "Откройте созданную поставку. Проверьте маркетплейс WB, юрлицо и склад списания. В базовом сценарии склад списания — «Общий склад с товарами». Если по задаче нужен другой фактический склад, выберите его вручную. Если по умолчанию стоит «Коледино», не оставляйте его случайно: склад должен совпадать с текущей поставкой.",
        result: "Открыта правильная поставка, склад и основные поля проверены.",
        image: "./assets/wb_supply_02_selsup_order.png",
        caption: "Карточка поставки SelsUp с полями склада, маркетплейса и переходом дальше."
      },
      {
        title: "Создать или открыть поставку в WB",
        why: "SelsUp и WB должны говорить об одной и той же поставке. Для этого нужен номер WB.",
        action:
          "На портале WB откройте раздел поставок и найдите поставку, созданную менеджером, либо создайте новую по процессу WB. Загрузите XLS с товарами, выберите склад, тип поставки и дату. Запомните дату: ее нужно повторить в SelsUp и позже сверить с датой СДЭК. Скопируйте только цифры номера поставки WB в верхней части экрана.",
        result: "В WB есть поставка с товарами, выбранными складом и датой, а ее номер скопирован без лишнего текста.",
        image: "./assets/wb_supply_04_wb_goods.png",
        caption: "Экран WB, где загружается XLS и проверяется состав поставки."
      },
      {
        title: "Связать номер WB с SelsUp",
        why: "Поле «Внешний номер» связывает заказ SelsUp с поставкой на WB. Без него дальнейшая упаковка и документы будут расходиться.",
        action:
          "Вернитесь в SelsUp. Вставьте номер WB в поле «Внешний номер», поставьте дату как в WB, выберите юрлицо «ИП Андреев Никита Алексеевич». Название можно сократить до города поставки. Нажмите «Сохранить». После сохранения должна появиться кнопка «Перейти к упаковке» или следующий шаг процесса.",
        result: "Номер WB сохранен в SelsUp, поставка связана и готова к упаковке.",
        image: "./assets/wb_supply_03_external_number.png",
        caption: "Заполнение внешнего номера WB и сохранение поставки в SelsUp."
      },
      {
        title: "Сгенерировать ШК коробов в WB",
        why: "Каждый физический короб должен получить свой штрихкод короба. По нему SelsUp поймет, какие товары лежат внутри.",
        action:
          "В WB откройте «Упаковка и печать ШК». Укажите фактическое количество коробов и сгенерируйте ШК. Если позже окажутся лишние пустые короба, их нужно удалить в WB через меню с тремя точками.",
        result: "В WB создан список коробов с отдельными ШК для каждого короба.",
        image: "./assets/wb_supply_06_box_barcodes.png",
        caption: "Список коробов WB, кнопки скачивания Excel и печати."
      },
      {
        title: "Распечатать ШК коробов",
        why: "Ошибки на этом шаге приводят к перепутанным коробам при приемке и сканировании.",
        action:
          "В настройках печати выберите тип «Штрихкод», бумагу «Термо наклейка», размер 58x40. Печатайте на принтере 360, 2 копии, горизонтальная ориентация. На каждый короб наклейте 2 одинаковых ШК короба и подпишите короба по порядку: 1, 2, 3 и дальше. Не закрывайте штрихкоды скотчем.",
        result: "Все короба подписаны и имеют по два читаемых ШК короба.",
        image: "./assets/wb_supply_05_print_settings.png",
        caption: "Настройки печати термонаклейки 58x40 для ШК коробов."
      },
      {
        title: "Загрузить ШК коробов в SelsUp",
        why: "SelsUp должен знать список коробов WB, чтобы оператор мог сканировать короб и товары внутри него.",
        action:
          "Скачайте XLS со штрихкодами коробов из WB. В SelsUp откройте поставку, перейдите на вкладку «ШК коробов» и загрузите этот файл. Затем откройте «Задания» → «Упаковка» или нажмите «Перейти к упаковке».",
        result: "SelsUp видит ШК коробов, открыт экран упаковки.",
        image: "./assets/wb_supply_06_box_barcodes.png",
        caption: "Файл ШК коробов скачивается из WB и затем загружается в SelsUp."
      },
      {
        title: "Сканировать короб и товары",
        why: "Здесь чаще всего путают ШК короба и ШК поставки. Сначала всегда сканируется именно ШК короба.",
        action:
          "Разбудите сканер одним нажатием. Отсканируйте ШК короба в верхнее поле, нажмите Enter, если поле не перешло дальше само. Затем сканируйте товар, введите количество и верните курсор в начальное верхнее поле перед следующим товаром. После заполнения короба заклейте его и переходите к следующему коробу.",
        result: "В SelsUp по каждому коробу указаны правильные товары и количества.",
        image: "./assets/wb_supply_07_selsup_scan.png",
        caption: "Экран упаковки SelsUp: сначала ШК короба, затем товар и количество."
      },
      {
        title: "Загрузить распределение коробов обратно в WB",
        why: "WB должен получить не просто список коробов, а распределение: какие баркоды и сколько штук лежат в каждом коробе.",
        action:
          "После упаковки всех товаров вернитесь в SelsUp в заказ на отгрузку и скачайте Excel через «ШК коробов» со стрелкой вниз. В WB откройте «Упаковка и печать ШК» → «Через Excel» → «Загрузить через Excel», выберите файл и подтвердите обновление коробов.",
        result: "В WB обновлены короба, справа видны баркоды и количество штук по каждому коробу.",
        image: "./assets/wb_supply_06_box_barcodes.png",
        caption: "Загрузка Excel с распределением товаров по коробам обратно в WB."
      },
      {
        title: "Проверить упаковку в WB",
        why: "До пропуска нужно поймать расхождения: лишние пустые короба, неверное количество баркодов или штук.",
        action:
          "Сверьте верхний счетчик упакованных коробов, баркодов и штук. Откройте несколько коробов и проверьте, что внутри есть товары. Если в WB остались пустые лишние короба, удалите их вручную через три точки.",
        result: "Количество коробов и товаров в WB совпадает с фактической упаковкой.",
        image: "./assets/wb_supply_06_box_barcodes.png",
        caption: "Финальная проверка коробов и количества товаров в WB."
      },
      {
        title: "Заполнить пропуск WB",
        why: "В пропуске фиксируется способ отгрузки и печатается ШК поставки, который клеится отдельно от ШК короба.",
        action:
          "Если в поставке до 10 коробов включительно, выберите способ отгрузки «отдельные короба». Если больше 10 коробов, выберите «на палете». Для стандартных коробов 60x40x40 считайте палеты так: 11-16 коробов — 1 палета, 17-32 — 2 палеты, дальше по 16 коробов на палету. Способ доставки — транспортной компанией, время — с 12 до 18. Распечатайте ШК поставки по одному на каждый короб и не заклеивайте его скотчем.",
        result: "Пропуск сохранен, способ отгрузки выбран правильно, ШК поставки распечатаны.",
        image: "./assets/wb_supply_08_pass_print.png",
        caption: "Печать ШК поставки из раздела пропуска WB."
      },
      {
        title: "Оформить СДЭК и завершить поставку",
        why: "Количество грузовых мест в СДЭК должно совпасть с количеством коробов, а дата WB — с датой доставки на маркетплейс.",
        action:
          "В СДЭК найдите похожий заказ по нужному городу, скопируйте его и вставьте номер поставки WB в поле номера заказа на маркетплейсе. Оставьте одно грузовое место как шаблон: 60x40x40, вес около 17 кг, номер места 1. Скопируйте грузовое место до количества коробов. Если не успеваете сдать груз до 17:00, выбирайте дату следующего дня. Напечатайте ШК СДЭК в формате A16 на принтере 420 и наклейте место 1 на короб 1, место 2 на короб 2 и так далее. В SelsUp нажимайте «Следующий шаг» до статуса «Отгружен», а в WB перенесите дату поставки на дату доставки СДЭК.",
        result: "Количество мест в СДЭК совпадает с коробами, этикетки наклеены по номерам, SelsUp и WB доведены до финального состояния.",
        image: "./assets/wb_supply_08_pass_print.png",
        caption: "После пропуска остаются оформление СДЭК, финальный статус SelsUp и дата WB."
      }
    ],
    checklist: [
      "XLS поставки загружен в SelsUp, а не перепутан с файлом ШК коробов.",
      "В WB открыта правильная поставка, номер скопирован только цифрами.",
      "В SelsUp заполнен «Внешний номер», дата, юрлицо и фактический склад.",
      "Сгенерировано ровно фактическое количество коробов.",
      "На каждом коробе есть 2 ШК короба, короб подписан номером, штрихкод не закрыт скотчем.",
      "При упаковке сначала сканируется ШК короба, затем ШК товара и количество.",
      "Excel с распределением коробов из SelsUp загружен обратно в WB.",
      "В WB нет пустых лишних коробов, счетчики коробов, баркодов и штук сходятся.",
      "До 10 коробов включительно выбран способ «отдельные короба», больше 10 — «на палете».",
      "Количество грузовых мест в СДЭК равно количеству коробов, дата WB перенесена на дату доставки СДЭК."
    ],
    issues: [
      {
        title: "Перепутали ШК короба и ШК поставки",
        text: "Для упаковки в SelsUp первым сканируется ШК короба. ШК поставки печатается из пропуска и клеится отдельно по одному на каждый короб."
      },
      {
        title: "Оставили случайный склад",
        text: "Если по умолчанию стоит «Коледино», проверьте задачу. Склад должен соответствовать фактической поставке."
      },
      {
        title: "Неверно выбрали короб или палету",
        text: "До 10 коробов включительно — «отдельные короба». Больше 10 — «на палете». Для коробов 60x40x40 считайте по 16 коробов на палету."
      },
      {
        title: "Не вернули Excel с упаковкой в WB",
        text: "После сканирования в SelsUp обязательно скачайте «ШК коробов» и загрузите файл в WB через Excel, иначе WB не увидит распределение товаров по коробам."
      },
      {
        title: "СДЭК не совпал с коробами",
        text: "Количество грузовых мест в СДЭК должно быть равно количеству коробов. Этикетки клеятся строго по номерам: место 1 на короб 1."
      },
      {
        title: "Дата изменилась после оформления",
        text: "Если поменялась дата WB, СДЭК или пропуск, вернитесь и синхронизируйте дату во всех местах: WB, SelsUp и заказ СДЭК."
      }
    ]
  },
  {
    id: "merge-supply-card",
    topic: "Честный знак и Selsup",
    title: "Объединение в одну карточку для поставки",
    description:
      "Как в заказе на отгрузку Selsup проверить колонку «Артикул для объединения в одну карточку» и убедиться, что лист сборки сформирован правильно.",
    role: "Склад / оператор",
    duration: "1-2 минуты",
    sourceVideo: "./videos/merge-supply-card.mp4",
    videoNote:
      "Исходный ролик длится около 43 секунд. Его стоит открыть, если нужно быстро сверить, какие строки выбрать перед объединением.",
    keywords: [
      "карточки",
      "поставка",
      "объединение",
      "одна карточка",
      "товар",
      "варианты",
      "выбрать строки",
      "заказ на отгрузку",
      "лист сборки",
      "артикул для объединения",
      "wildberries",
      "инструкция"
    ],
    steps: [
      {
        title: "Открыть заказ на отгрузку",
        why: "Объединение карточек проверяется внутри конкретного заказа на отгрузку, где собрана поставка.",
        action:
          "В Selsup откройте раздел «Заказы на отгрузку» и перейдите в нужный заказ. Проверьте склад, маркетплейс, внешний номер и блок «Планирование поставок».",
        result: "Открыт правильный заказ, в котором видна таблица товаров поставки.",
        image: "./assets/merge_supply_01_order.png",
        caption: "Заказ на отгрузку и блок планирования поставок."
      },
      {
        title: "Найти таблицу товаров поставки",
        why: "Все дальнейшие проверки выполняются по строкам таблицы: в ней видны товары, количество, штрихкод и данные для объединения.",
        action:
          "Прокрутите заказ до таблицы в блоке «Планирование поставок». Найдите строки товаров и колонку «Артикул для объединения в одну карточку».",
        result: "Вы видите, по каким строкам будет формироваться одна карточка в листе сборки.",
        image: "./assets/merge_supply_02_table.png",
        caption: "Таблица товаров поставки и колонка объединения."
      },
      {
        title: "Проверить артикул для объединения",
        why: "Одинаковое значение в этой колонке означает, что позиции будут собраны в одну карточку при печати/сборке.",
        action:
          "Сравните значение в колонке «Артикул для объединения в одну карточку» у связанных строк. Для вариантов одного товара значение должно совпадать.",
        result: "Связанные позиции имеют одинаковый артикул объединения, а разные товары не смешиваются между собой.",
        image: "./assets/merge_supply_03_article_column.png",
        caption: "Колонка, которая определяет объединение строк в одну карточку."
      },
      {
        title: "Сверить группы товаров",
        why: "Перед печатью важно убедиться, что однотипные товары сгруппированы правильно, а случайные строки не попали в чужую группу.",
        action:
          "Просмотрите несколько строк поставки: название, размер, количество и артикул объединения. Не удаляйте строки без проверки группы.",
        result: "Понятно, какие строки будут объединены, и в таблице нет очевидного смешения разных товаров.",
        image: "./assets/merge_supply_04_groups.png",
        caption: "Сверка названий товаров и артикулов группировки."
      },
      {
        title: "Проверить лист сборки",
        why: "Лист сборки показывает итог: как товары попадут в печатную форму для сборки поставки.",
        action:
          "Нажмите «Лист сборки» и проверьте PDF: заказ, товар, штрихкоды и количество к отгрузке должны соответствовать таблице.",
        result: "Лист сборки сформирован корректно, поставку можно передавать дальше в работу.",
        image: "./assets/merge_supply_05_print_list.png",
        caption: "Печатный лист сборки после проверки объединения карточек."
      }
    ],
    checklist: [
      "Открыт правильный заказ на отгрузку.",
      "В таблице найден столбец «Артикул для объединения в одну карточку».",
      "У вариантов одного товара одинаковое значение артикула объединения.",
      "Разные товары не объединены одним случайным значением.",
      "Лист сборки открыт и визуально совпадает с таблицей поставки."
    ],
    issues: [
      {
        title: "Одинаковый артикул у разных товаров",
        text: "Если в колонке объединения одинаковое значение стоит у разных товаров, они могут попасть в одну карточку ошибочно. Проверьте строки до печати листа сборки."
      },
      {
        title: "Связанные варианты не объединяются",
        text: "Если варианты одного товара имеют разные значения в колонке объединения, они попадут в лист сборки раздельно."
      },
      {
        title: "Не тот заказ",
        text: "Перед проверкой убедитесь, что открыт нужный заказ на отгрузку, правильный склад и маркетплейс."
      },
      {
        title: "Лист сборки не совпадает",
        text: "Если PDF не совпадает с таблицей, вернитесь в заказ, проверьте артикулы объединения и сформируйте лист сборки повторно."
      }
    ]
  },
  {
    id: "selsup-honest-sign-base",
    topic: "Честный знак и Selsup",
    title: "Публикация карточек и обновление связей в Selsup",
    description:
      "Базовый учебный материал по работе с карточками Честного знака: публикация, проверка статуса, связь с товаром и контроль результата.",
    role: "Оператор / менеджер товара",
    duration: "10-15 минут",
    sourceVideo: "./videos/honest-sign-base.mp4",
    videoNote:
      "Это исходное видео предыдущего учебного материала. Его можно открыть, если нужно сверить детали с демонстрацией на экране.",
    keywords: [
      "честный знак",
      "selsup",
      "карточки товара",
      "публикация",
      "статус",
      "интеграция",
      "токен",
      "национальный каталог",
      "связать карточки",
      "товар",
      "инструкция"
    ],
    steps: [
      {
        title: "Открыть товар и панель действий",
        why: "Работу начинают с нужного товара, чтобы дальнейшие действия относились к правильной карточке.",
        action: "Откройте товар в Selsup и проверьте доступность панели действий по карточкам.",
        result: "Товар открыт, действия по карточкам доступны.",
        image: "./assets/01_product_toolbar.png",
        caption: "Панель действий в карточке товара."
      },
      {
        title: "Проверить настройки при ошибке",
        why: "Если карточки не подтягиваются, часто причина связана с настройками интеграции или доступом.",
        action: "Перейдите в настройки и проверьте блок, связанный с Честным знаком.",
        result: "Понятно, какие настройки мешают обновлению карточек.",
        image: "./assets/02_error_settings.png",
        caption: "Экран проверки настроек при ошибке."
      },
      {
        title: "Открыть раздел интеграций",
        why: "Интеграция отвечает за обмен данными между Selsup и Честным знаком.",
        action: "В настройках откройте раздел интеграций и найдите подключение Честного знака.",
        result: "Нужная интеграция найдена и готова к проверке.",
        image: "./assets/03_integrations.png",
        caption: "Список интеграций в Selsup."
      },
      {
        title: "Обновить токен доступа",
        why: "Актуальный токен нужен, чтобы Selsup мог получить данные карточек из Честного знака.",
        action: "Получите новый токен на рабочем месте с электронной подписью и сохраните настройки.",
        result: "Токен получен и сохранён.",
        image: "./assets/04_token.png",
        caption: "Получение и сохранение токена."
      },
      {
        title: "Повторить операцию по карточкам",
        why: "После обновления доступа нужно снова запустить действие, которое ранее не выполнилось.",
        action: "Вернитесь к товару и повторите поиск или связывание карточек национального каталога.",
        result: "Операция завершилась успешно.",
        image: "./assets/05_success.png",
        caption: "Успешное выполнение операции."
      },
      {
        title: "Проверить итоговый статус",
        why: "Финальная проверка нужна, чтобы убедиться, что карточки действительно обновились.",
        action: "Проверьте таблицу статусов и убедитесь, что карточки готовы к дальнейшей работе.",
        result: "Статусы в таблице подтверждают готовность карточек.",
        image: "./assets/06_status_table.png",
        caption: "Итоговая таблица статусов."
      }
    ],
    checklist: [
      "Открыт правильный товар в Selsup.",
      "Проверены настройки интеграции Честного знака.",
      "Токен доступа получен и сохранён.",
      "Операция поиска или связывания карточек повторена.",
      "Итоговый статус карточек проверен в таблице."
    ],
    issues: [
      {
        title: "Не выбран нужный товар",
        text: "Перед операцией убедитесь, что открыта именно та карточка товара, по которой нужно обновить данные Честного знака."
      },
      {
        title: "Токен устарел",
        text: "Если Selsup не может подтянуть карточки, обновите токен в интеграции Честного знака и сохраните настройки."
      },
      {
        title: "Нет электронной подписи",
        text: "Некоторые действия выполняются только с рабочего места, где доступна электронная подпись."
      },
      {
        title: "Статус не изменился сразу",
        text: "После запуска операции подождите немного и обновите страницу товара, затем проверьте таблицу статусов повторно."
      }
    ]
  }
];

let materials = [...baseMaterials];
const publishedEditableIds = new Set();

async function loadPublishedMaterials() {
  try {
    const response = await fetch(`./published-lessons.json?${Date.now()}`);
    if (!response.ok) return;
    const published = await response.json();
    if (!Array.isArray(published)) return;
    published.forEach((item) => {
      if (!item?.id) return;
      publishedEditableIds.add(item.id);
      const index = materials.findIndex((entry) => entry.id === item.id);
      if (index >= 0) {
        materials[index] = item;
      } else {
        materials.push(item);
      }
    });
  } catch {
    /* published-lessons.json may be missing offline */
  }
}

const synonyms = {
  "эцп": ["подпись", "цифровая подпись", "электронная подпись"],
  "токен": ["интеграция", "доступ", "получить токен"],
  "поставка": ["карточка", "карточки", "товар"],
  "ошибка": ["не получилось", "позже", "сбой"],
  "видео": ["ролик", "исходник", "исходное видео"],
  "wb": ["вб", "wildberries", "вайлдберриз"],
  "вб": ["wb", "wildberries", "вайлдберриз"],
  "сдэк": ["cdek", "транспортная компания", "доставка"],
  "шк": ["штрихкод", "баркод", "шк коробов", "шк поставки"],
  "короба": ["короб", "упаковка", "палета", "грузовое место"],
  "палета": ["паллет", "поддон", "больше 10 коробов"]
};

const state = {
  selectedMaterialId: materials[0].id,
  currentStep: 0,
  currentView: "guide",
  currentIssue: 0,
  query: "",
  completed: {},
  mode: "library",
  editMode: false,
  displayMode: "extended"
};

const nodes = {
  appShell: document.querySelector(".app-shell"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarRestore: document.querySelector("#sidebar-restore"),
  topicList: document.querySelector("#topic-list"),
  materialList: document.querySelector("#material-list"),
  searchInput: document.querySelector("#search-input"),
  matchCount: document.querySelector("#match-count"),
  materialsCount: document.querySelector("#materials-count"),
  stepsCount: document.querySelector("#steps-count"),
  videosCount: document.querySelector("#videos-count"),
  lessonTopic: document.querySelector("#lesson-topic"),
  lessonTitle: document.querySelector("#lesson-title"),
  lessonDescription: document.querySelector("#lesson-description"),
  lessonMeta: document.querySelector("#lesson-meta"),
  keywordRow: document.querySelector("#keyword-row"),
  viewTabs: document.querySelectorAll(".view-tab"),
  views: {
    guide: document.querySelector("#guide-view"),
    check: document.querySelector("#check-view"),
    issues: document.querySelector("#issues-view"),
    video: document.querySelector("#video-view")
  },
  guideView: document.querySelector("#guide-view"),
  processStrip: document.querySelector("#process-strip"),
  prevStep: document.querySelector("#prev-step"),
  nextStep: document.querySelector("#next-step"),
  stepKicker: document.querySelector("#step-kicker"),
  stepTitle: document.querySelector("#step-title"),
  stepWhy: document.querySelector("#step-why"),
  stepAction: document.querySelector("#step-action"),
  stepResult: document.querySelector("#step-result"),
  stepImages: document.querySelector("#step-images"),
  stepComplete: document.querySelector("#step-complete"),
  lightbox: document.querySelector("#image-lightbox"),
  lightboxImage: document.querySelector("#lightbox-image"),
  lightboxCaption: document.querySelector("#lightbox-caption"),
  lightboxClose: document.querySelector("#lightbox-close"),
  checklist: document.querySelector("#checklist"),
  mistakeGrid: document.querySelector("#mistake-grid"),
  mistakeDetail: document.querySelector("#mistake-detail"),
  sourceVideo: document.querySelector("#source-video"),
  videoTitle: document.querySelector("#video-title"),
  videoNote: document.querySelector("#video-note"),
  videoLink: document.querySelector("#video-link"),
  libraryLayout: document.querySelector("#library-layout"),
  developLayout: document.querySelector("#develop-layout"),
  modeButtons: document.querySelectorAll(".mode-btn"),
  railLibrary: document.querySelector("#rail-library"),
  railTop: document.querySelector(".rail-top"),
  editLesson: document.querySelector("#edit-lesson"),
  saveLesson: document.querySelector("#save-lesson"),
  openBuilder: document.querySelector("#open-builder")
};

const editableLessonFields = () => [
  nodes.lessonTopic,
  nodes.lessonTitle,
  nodes.lessonDescription,
  nodes.stepTitle,
  nodes.stepWhy,
  nodes.stepAction,
  nodes.stepResult
];

function normalize(value) {
  return value.toLowerCase().replaceAll("ё", "е").trim();
}

function searchTerms(query) {
  const base = normalize(query)
    .split(/[\s,.;:!?]+/)
    .filter((term) => term.length > 1);

  return [...new Set(base.flatMap((term) => [term, ...(synonyms[term] || []).map(normalize)]))];
}

function materialText(material) {
  return normalize(
    [
      material.topic,
      material.title,
      material.description,
      material.role,
      material.duration,
      material.keywords.join(" "),
      material.steps.map((step) => `${step.title} ${step.why} ${step.action} ${step.result}`).join(" "),
      material.checklist.join(" "),
      material.issues.map((issue) => `${issue.title} ${issue.text}`).join(" ")
    ].join(" ")
  );
}

function scoreMaterial(material, query) {
  const terms = searchTerms(query);
  if (!terms.length) return 1;

  const haystack = materialText(material);
  const title = normalize(`${material.topic} ${material.title} ${material.keywords.join(" ")}`);
  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 4;
    if (haystack.includes(term)) return score + 1;
    return score;
  }, 0);
}

function filteredMaterials() {
  return materials
    .map((material) => ({ material, score: scoreMaterial(material, state.query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.material);
}

function selectedMaterial() {
  return materials.find((material) => material.id === state.selectedMaterialId) || materials[0];
}

function completedSet(materialId = state.selectedMaterialId) {
  if (!state.completed[materialId]) {
    state.completed[materialId] = new Set();
  }
  return state.completed[materialId];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function annotationLabels(annotations = []) {
  return new Set(
    annotations
      .filter((item) => item?.label)
      .map((item) => String(item.label))
  );
}

function labelsFromScreenshots(screenshots) {
  const labels = new Set();
  screenshots.forEach((shot) => {
    annotationLabels(shot.annotations).forEach((label) => labels.add(label));
  });
  return labels;
}

function plainTextFromHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value || "");
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

function sanitizeLessonHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const allowed = new Set(["STRONG", "B", "SPAN", "BR", "P", "DIV"]);
  const walk = (node) => {
    [...node.children].forEach((child) => {
      if (!allowed.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        return;
      }
      if (child.tagName === "SPAN" && !child.classList.contains("lesson-text-red")) {
        child.classList.add("lesson-text-red");
      }
      walk(child);
    });
  };
  walk(template.content);
  return template.innerHTML;
}

function renderRichText(html) {
  return sanitizeLessonHtml(html);
}

function renderInteractiveActionHtml(html, labels) {
  const source = String(html || "");
  if (!plainTextFromHtml(source)) return "";
  const labelSet = labels instanceof Set ? labels : new Set(labels);
  const container = document.createElement("div");
  container.innerHTML = sanitizeLessonHtml(source);

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text || !labelSet.size) return;
      const re = /\{(\d+)\}/g;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let last = 0;
      let match;
      while ((match = re.exec(text)) !== null) {
        fragment.append(document.createTextNode(text.slice(last, match.index)));
        const label = match[1];
        if (labelSet.has(label)) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "action-ref-btn";
          button.dataset.label = label;
          button.textContent = `{${label}}`;
          fragment.append(button);
        } else {
          fragment.append(document.createTextNode(match[0]));
        }
        last = match.index + match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(last)));
      node.replaceWith(fragment);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);
    }
  };

  [...container.childNodes].forEach(walk);
  return container.innerHTML;
}

function renderInteractiveAction(text, labels) {
  const source = String(text || "");
  if (source.includes("<")) {
    return renderInteractiveActionHtml(source, labels);
  }
  if (!source.trim()) return "";
  const labelSet = labels instanceof Set ? labels : new Set(labels);
  const parts = [];
  const re = /\{(\d+)\}/g;
  let last = 0;
  let match;
  while ((match = re.exec(source)) !== null) {
    parts.push(escapeHtml(source.slice(last, match.index)));
    const label = match[1];
    if (labelSet.has(label)) {
      parts.push(
        `<button type="button" class="action-ref-btn" data-label="${escapeHtml(label)}">{${escapeHtml(label)}}</button>`
      );
    } else {
      parts.push(escapeHtml(match[0]));
    }
    last = match.index + match[0].length;
  }
  parts.push(escapeHtml(source.slice(last)));
  return parts.join("");
}

function markerStyle(item, width, height) {
  const w = Number(width) || 1;
  const h = Number(height) || 1;
  if (item.type === "rect") {
    return {
      left: `${(item.x / w) * 100}%`,
      top: `${(item.y / h) * 100}%`,
      width: `${(item.w / w) * 100}%`,
      height: `${(item.h / h) * 100}%`,
    };
  }
  if (item.type === "circle") {
    const diameter = item.r * 2;
    return {
      left: `${((item.cx - item.r) / w) * 100}%`,
      top: `${((item.cy - item.r) / h) * 100}%`,
      width: `${(diameter / w) * 100}%`,
      height: `${(diameter / h) * 100}%`,
    };
  }
  return null;
}

function renderScreenshotMarkers(annotations, width, height, pulseLabel = "") {
  return (annotations || [])
    .filter((item) => item?.label && (item.type === "rect" || item.type === "circle"))
    .map((item) => {
      const style = markerStyle(item, width, height);
      if (!style) return "";
      const pulse = pulseLabel === String(item.label) ? " is-pulsing" : "";
      const shapeClass = item.type === "circle" ? " screenshot-marker-circle" : "";
      const styleText = Object.entries(style)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
      return `<div class="screenshot-marker${shapeClass}${pulse}" data-label="${escapeHtml(String(item.label))}" style="${styleText}">
        <span class="screenshot-marker-badge">${escapeHtml(String(item.label))}</span>
      </div>`;
    })
    .join("");
}

let pulseTimer = null;

function alignSlideWithCopy(frame) {
  const copy = document.querySelector(".step-copy");
  if (!frame || !copy) return;
  const copyTop = copy.getBoundingClientRect().top;
  const frameTop = frame.getBoundingClientRect().top;
  const delta = frameTop - copyTop;
  if (Math.abs(delta) > 4) {
    window.scrollBy({ top: delta, behavior: "smooth" });
  }
}

function pulseScreenshotLabel(label) {
  if (pulseTimer) {
    clearTimeout(pulseTimer);
    pulseTimer = null;
  }
  document.querySelectorAll(".screenshot-marker, .action-ref-btn").forEach((node) => {
    node.classList.toggle("is-pulsing", node.dataset.label === String(label));
  });
  const target = document.querySelector(`.screenshot-marker[data-label="${CSS.escape(String(label))}"]`);
  const frame = target?.closest(".screenshot-frame");
  if (frame && nodes.guideView?.classList.contains("is-extended")) {
    alignSlideWithCopy(frame);
  } else {
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  pulseTimer = window.setTimeout(() => {
    document.querySelectorAll(".is-pulsing").forEach((node) => node.classList.remove("is-pulsing"));
    pulseTimer = null;
  }, 2400);
}

function bindInteractiveLessonHandlers(screenshots, labels) {
  document.querySelectorAll(".action-ref-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      pulseScreenshotLabel(button.dataset.label);
    });
  });
  document.querySelectorAll(".screenshot-marker").forEach((marker) => {
    marker.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      pulseScreenshotLabel(marker.dataset.label);
    });
  });
}

function renderTopics(items) {
  const topics = [...new Set(materials.map((material) => material.topic))];
  nodes.topicList.innerHTML = topics
    .map((topic) => {
      const count = items.filter((material) => material.topic === topic).length;
      const active = selectedMaterial().topic === topic ? " is-active" : "";
      return `<button class="topic-button${active}" type="button" data-topic="${topic}">
        <span>${topic}</span><strong>${count}</strong>
      </button>`;
    })
    .join("");

  nodes.topicList.querySelectorAll(".topic-button").forEach((button) => {
    button.addEventListener("click", () => {
      const firstInTopic = materials.find((material) => material.topic === button.dataset.topic);
      if (firstInTopic) selectMaterial(firstInTopic.id);
    });
  });
}

function renderMaterialList(items) {
  if (!items.length) {
    nodes.materialList.innerHTML = `<div class="empty-state">По такому запросу пока ничего не найдено.</div>`;
    return;
  }

  nodes.materialList.innerHTML = items
    .map((material) => {
      const active = material.id === state.selectedMaterialId ? " is-active" : "";
      return `<button class="material-card${active}" type="button" data-material="${material.id}">
        <strong>${material.title}</strong>
        <small>${material.steps.length} шагов · ${material.duration}</small>
      </button>`;
    })
    .join("");

  nodes.materialList.querySelectorAll(".material-card").forEach((button) => {
    button.addEventListener("click", () => selectMaterial(button.dataset.material));
  });
}

function stepScreenshots(step) {
  if (Array.isArray(step.images) && step.images.length) {
    return step.images;
  }
  if (step.image) {
    return [{ image: step.image, caption: step.caption || "" }];
  }
  return [];
}

function renderLesson() {
  const material = selectedMaterial();
  const step = material.steps[state.currentStep] || material.steps[0];

  nodes.lessonTopic.textContent = material.topic;
  nodes.lessonTitle.textContent = material.title;
  nodes.lessonDescription.textContent = material.description;
  const doneCount = completedSet(material.id).size;
  nodes.lessonMeta.innerHTML = `<span>Роль: ${material.role}</span><span>Время: ${material.duration}</span><span>Понятно: ${doneCount}/${material.steps.length}</span>`;
  const tags = [...new Set([...material.keywords, "Инструкция", "Контроль", "Ошибки", "Исходное видео"])];
  nodes.keywordRow.innerHTML = tags.map((keyword) => `<span>${keyword}</span>`).join("");

  nodes.processStrip.innerHTML = material.steps
    .map((item, index) => {
      const active = index === state.currentStep ? " is-active" : "";
      const number = String(index + 1).padStart(2, "0");
      return `<button class="process-step${active}" type="button" data-step="${index}">
        <span>${number}</span><strong>${item.title}</strong>
      </button>`;
    })
    .join("");

  nodes.processStrip.querySelectorAll(".process-step").forEach((button) => {
    button.addEventListener("click", () => setStep(Number(button.dataset.step)));
  });

  nodes.stepKicker.textContent = `Шаг ${state.currentStep + 1} из ${material.steps.length}`;
  nodes.stepTitle.textContent = step.title;
  nodes.stepWhy.innerHTML = renderRichText(step.why);
  const screenshots = stepScreenshots(step);
  const labels = labelsFromScreenshots(screenshots);
  if (state.editMode) {
    nodes.stepAction.innerHTML = renderRichText(step.action);
  } else if (labels.size) {
    nodes.stepAction.innerHTML = renderInteractiveAction(step.action, labels);
  } else {
    nodes.stepAction.innerHTML = renderRichText(step.action);
  }
  nodes.stepResult.innerHTML = renderRichText(step.result);
  if (!screenshots.length) {
    nodes.stepImages.innerHTML = `<div class="screenshot-frame"><p class="screenshot-empty">Скриншот не добавлен</p></div>`;
  } else {
    nodes.stepImages.innerHTML = screenshots
      .map((item, index) => {
        const caption = item.caption
          ? `<figcaption>${item.caption}${screenshots.length > 1 ? ` · скрин ${index + 1}` : ""}</figcaption>`
          : screenshots.length > 1
            ? `<figcaption>Скриншот ${index + 1}</figcaption>`
            : "";
        return `<figure class="screenshot-frame">
          <button class="screenshot-zoom" type="button" aria-label="Открыть скриншот крупно" data-image-index="${index}">
            <span class="screenshot-media">
              <img src="${item.image}" alt="Скриншот: ${step.title}${screenshots.length > 1 ? ` (${index + 1})` : ""}" data-shot-index="${index}" />
              ${
                item.annotations?.length
                  ? `<div class="screenshot-overlay">${renderScreenshotMarkers(item.annotations, item.width, item.height)}</div>`
                  : ""
              }
            </span>
          </button>
          ${caption}
        </figure>`;
      })
      .join("");
    nodes.stepImages.querySelectorAll(".screenshot-zoom").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.closest(".screenshot-marker, .action-ref-btn")) return;
        const item = screenshots[Number(button.dataset.imageIndex)];
        if (!item) return;
        nodes.lightboxImage.src = item.image;
        nodes.lightboxImage.alt = button.querySelector("img")?.alt || "";
        nodes.lightboxCaption.textContent = item.caption || "";
        nodes.lightbox.hidden = false;
      });
    });
    nodes.stepImages.querySelectorAll("img[data-shot-index]").forEach((img) => {
      img.addEventListener("load", () => {
        const shot = screenshots[Number(img.dataset.shotIndex)];
        if (!shot?.annotations?.length || shot.width) return;
        shot.width = img.naturalWidth;
        shot.height = img.naturalHeight;
        const overlay = img.parentElement?.querySelector(".screenshot-overlay");
        if (overlay) {
          overlay.innerHTML = renderScreenshotMarkers(shot.annotations, shot.width, shot.height);
          overlay.querySelectorAll(".screenshot-marker").forEach((marker) => {
            marker.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              pulseScreenshotLabel(marker.dataset.label);
            });
          });
        }
      });
    });
    bindInteractiveLessonHandlers(screenshots, labels);
  }
  nodes.stepComplete.checked = completedSet(material.id).has(state.currentStep);

  nodes.checklist.innerHTML = material.checklist
    .map((item) => `<label><input type="checkbox" /><span>${item}</span></label>`)
    .join("");

  nodes.mistakeGrid.innerHTML = material.issues
    .map((issue, index) => {
      const active = index === state.currentIssue ? " is-active" : "";
      return `<button class="mistake${active}" type="button" data-issue="${index}">
        <strong>${issue.title}</strong><span>${issue.text}</span>
      </button>`;
    })
    .join("");
  nodes.mistakeDetail.textContent = material.issues[state.currentIssue]?.text || "";
  nodes.mistakeGrid.querySelectorAll(".mistake").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentIssue = Number(button.dataset.issue);
      renderLesson();
    });
  });

  nodes.videoTitle.textContent = material.title;
  nodes.videoNote.textContent = material.videoNote;
  nodes.videoLink.href = material.sourceVideo;
  syncVideoSource();
  setLessonEditMode(state.editMode);
  updateLessonActionButtons(material);
}

function syncVideoSource() {
  const material = selectedMaterial();
  if (state.currentView === "video") {
    if (nodes.sourceVideo.getAttribute("src") !== material.sourceVideo) {
      nodes.sourceVideo.src = material.sourceVideo;
      nodes.sourceVideo.load();
    }
    return;
  }

  nodes.sourceVideo.pause();
  nodes.sourceVideo.removeAttribute("src");
  nodes.sourceVideo.load();
}

function renderShell() {
  const items = filteredMaterials();
  nodes.matchCount.textContent = String(items.length);
  nodes.materialsCount.textContent = String(materials.length);
  nodes.stepsCount.textContent = String(materials.reduce((sum, material) => sum + material.steps.length, 0));
  nodes.videosCount.textContent = String(materials.filter((material) => material.sourceVideo).length);
  renderTopics(items);
  renderMaterialList(items);
}

function setStep(index) {
  if (state.editMode) {
    readLessonEditsFromDom(selectedMaterial());
  }
  const material = selectedMaterial();
  state.currentStep = Math.max(0, Math.min(material.steps.length - 1, index));
  renderLesson();
}

function selectMaterial(id) {
  if (state.editMode) {
    readLessonEditsFromDom(selectedMaterial());
  }
  state.editMode = false;
  state.selectedMaterialId = id;
  state.currentStep = 0;
  state.currentIssue = 0;
  renderShell();
  renderLesson();
}

function setMode(mode) {
  state.mode = mode;
  const isLibrary = mode === "library";
  nodes.libraryLayout.classList.toggle("hidden", !isLibrary);
  nodes.developLayout.classList.toggle("hidden", isLibrary);
  document.querySelector(".topbar").classList.toggle("hidden", !isLibrary);
  nodes.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  nodes.railLibrary?.classList.toggle("hidden", !isLibrary);
  nodes.railTop?.classList.toggle("hidden", !isLibrary);
  if (!isLibrary) {
    nodes.sourceVideo.pause();
    const material = selectedMaterial();
    syncDevelopFrame(material?.builderProjectId);
  } else {
    syncVideoSource();
  }
}

const BUILDER_LOCAL_URL = "http://127.0.0.1:8765/";
const BUILDER_ONLINE_URL = "https://posoolonono.beget.app/x-active-builder/";

function isLocalHost() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function builderApiBase() {
  return isLocalHost() ? "http://127.0.0.1:8765" : "https://posoolonono.beget.app/x-active-builder";
}

function canEditMaterial(material) {
  return publishedEditableIds.has(material.id);
}

function setLessonEditMode(enabled) {
  const step = selectedMaterial().steps[state.currentStep];
  if (enabled && step && nodes.stepAction) {
    nodes.stepAction.innerHTML = renderRichText(step.action || "");
  }
  if (enabled && step && nodes.stepWhy) {
    nodes.stepWhy.innerHTML = renderRichText(step.why || "");
  }
  if (enabled && step && nodes.stepResult) {
    nodes.stepResult.innerHTML = renderRichText(step.result || "");
  }
  state.editMode = enabled;
  editableLessonFields().forEach((node) => {
    if (!node) return;
    node.contentEditable = enabled ? "true" : "false";
    node.classList.toggle("is-editing", enabled);
    node.spellcheck = enabled;
  });
  nodes.editLesson?.classList.toggle("hidden", enabled || !canEditMaterial(selectedMaterial()));
  nodes.saveLesson?.classList.toggle("hidden", !enabled);
}

function readLessonEditsFromDom(material) {
  const step = material.steps[state.currentStep] || material.steps[0];
  material.topic = nodes.lessonTopic.textContent.trim();
  material.title = nodes.lessonTitle.textContent.trim();
  material.description = nodes.lessonDescription.textContent.trim();
  if (step) {
    step.title = nodes.stepTitle.textContent.trim();
    step.why = nodes.stepWhy.innerHTML.trim();
    step.action = nodes.stepAction.innerHTML.trim();
    step.result = nodes.stepResult.innerHTML.trim();
    if (step.caption !== undefined) {
      step.caption = step.title;
    }
  }
}

function updateLessonActionButtons(material) {
  const editable = canEditMaterial(material);
  nodes.editLesson?.classList.toggle("hidden", !editable || state.editMode);
  nodes.saveLesson?.classList.toggle("hidden", !state.editMode);
  nodes.openBuilder?.classList.toggle("hidden", !editable && !material.builderProjectId);
}

function builderUrl(projectId) {
  const base = builderUrlRoot();
  if (!projectId) return base;
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}project=${encodeURIComponent(projectId)}`;
}

function builderUrlRoot() {
  return isLocalHost() ? BUILDER_LOCAL_URL : BUILDER_ONLINE_URL;
}

function syncDevelopFrame(projectId) {
  const frame = document.querySelector("#develop-frame");
  const note = document.querySelector("#develop-note");
  const link = document.querySelector("#develop-open-link");
  if (!frame) return;

  const url = builderUrl(projectId || "");
  if (link) link.href = url;
  frame.src = url;
  frame.classList.remove("hidden");
  note?.classList.add("hidden");
}

async function saveLessonEdits() {
  const material = selectedMaterial();
  if (!canEditMaterial(material)) return;
  readLessonEditsFromDom(material);
  nodes.saveLesson.disabled = true;
  nodes.saveLesson.textContent = "Сохранение…";
  try {
    const response = await fetch(`${builderApiBase()}/api/published-lessons/${encodeURIComponent(material.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(material)
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Не удалось сохранить урок.");
    }
    setLessonEditMode(false);
    updateLessonActionButtons(material);
    nodes.saveLesson.textContent = "Сохранить";
    alert(payload.message || "Урок сохранён.");
  } catch (error) {
    alert(error.message);
  } finally {
    nodes.saveLesson.disabled = false;
    if (!state.editMode) nodes.saveLesson.textContent = "Сохранить";
  }
}

nodes.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

function setView(view) {
  state.currentView = view;
  nodes.viewTabs.forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  Object.entries(nodes.views).forEach(([name, node]) => {
    node.classList.toggle("is-active", name === view);
  });
  syncVideoSource();
}

nodes.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  const items = filteredMaterials();
  if (items.length && !items.some((material) => material.id === state.selectedMaterialId)) {
    state.selectedMaterialId = items[0].id;
    state.currentStep = 0;
  }
  renderShell();
  renderLesson();
});

nodes.viewTabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

nodes.prevStep.addEventListener("click", () => setStep(state.currentStep - 1));
nodes.nextStep.addEventListener("click", () => setStep(state.currentStep + 1));

nodes.editLesson?.addEventListener("click", () => {
  enableLessonEditing();
});

nodes.saveLesson?.addEventListener("click", () => {
  saveLessonEdits();
});

nodes.openBuilder?.addEventListener("click", () => {
  const material = selectedMaterial();
  setMode("develop");
  syncDevelopFrame(material.builderProjectId);
});

editableLessonFields().forEach((node) => {
  node?.addEventListener("click", () => {
    if (!canEditMaterial(selectedMaterial())) return;
    if (!state.editMode) {
      enableLessonEditing();
    }
  });
});

function enableLessonEditing() {
  if (!canEditMaterial(selectedMaterial())) return;
  setLessonEditMode(true);
  updateLessonActionButtons(selectedMaterial());
}

nodes.stepComplete.addEventListener("change", () => {
  const set = completedSet();
  if (nodes.stepComplete.checked) {
    set.add(state.currentStep);
  } else {
    set.delete(state.currentStep);
  }
  renderLesson();
});

nodes.lightboxClose.addEventListener("click", () => {
  nodes.lightbox.hidden = true;
});

nodes.lightbox.addEventListener("click", (event) => {
  if (event.target === nodes.lightbox) {
    nodes.lightbox.hidden = true;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !nodes.lightbox.hidden) {
    nodes.lightbox.hidden = true;
  }
});

function setSidebarCollapsed(collapsed) {
  nodes.appShell.classList.toggle("is-sidebar-collapsed", collapsed);
  nodes.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
}

nodes.sidebarToggle.addEventListener("click", () => setSidebarCollapsed(true));
nodes.sidebarRestore.addEventListener("click", () => setSidebarCollapsed(false));

async function bootstrap() {
  await loadPublishedMaterials();
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("lesson");
  if (lessonId && materials.some((material) => material.id === lessonId)) {
    state.selectedMaterialId = lessonId;
  }
  nodes.guideView?.classList.add("is-extended");
  renderShell();
  renderLesson();
  setView("guide");
  setMode("library");
}

bootstrap();
