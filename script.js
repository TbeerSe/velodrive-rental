// @ts-nocheck

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

document.querySelectorAll(".bike-card").forEach((card) => {
  const hourlyPrice = Number(card.dataset.hourlyPrice);
  const hoursInput = card.querySelector(".hours-input");
  const dateInput = card.querySelector(".date-input");
  const totalPrice = card.querySelector(".total-price");
  const bookingForm = card.querySelector(".booking-form");
  const extraOptions = card.querySelectorAll(".extra-option");
  const bikeName = card.querySelector("h3").textContent.trim();

  function getOptionsPrice() {
    return [...extraOptions]
      .filter((option) => option.checked)
      .reduce((sum, option) => {
        return sum + Number(option.dataset.price);
      }, 0);
  }

  function getTotal(hours) {
    const optionsPrice = getOptionsPrice();

    return (hourlyPrice + optionsPrice) * hours;
  }

  function updateTotal() {
    /*
     * Не сбрасываем поле, если пользователь его очищает.
     * Это позволяет ввести новое значение.
     */
    if (hoursInput.value === "") {
      return;
    }

    const hours = Number(hoursInput.value);
    const total = getTotal(hours);

    totalPrice.textContent = currencyFormatter.format(total);
  }

  function validateHours() {
    const minHours = Number(hoursInput.min) || 1;
    const maxHours = Number(hoursInput.max) || 24;

    let hours = Number(hoursInput.value);

    if (!hours || hours < minHours) {
      hours = minHours;
    }

    if (hours > maxHours) {
      hours = maxHours;
    }

    hoursInput.value = hours;
    updateTotal();
  }

  function formatBookingDate(value) {
    if (!value) {
      return "—";
    }

    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-");

    return `${day}.${month}.${year}, ${timePart}`;
  }

  /*
   * Во время ввода только пересчитываем сумму.
   * Пустое поле не заменяется значением 1.
   */
  hoursInput.addEventListener("input", updateTotal);

  /*
   * Проверка min/max выполняется только после потери фокуса.
   */
  hoursInput.addEventListener("change", validateHours);

  /*
   * Пересчёт стоимости при выборе дополнительных опций.
   */
  extraOptions.forEach((option) => {
    option.addEventListener("change", updateTotal);
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    validateHours();

    const hours = Number(hoursInput.value);
    const total = getTotal(hours);
    const startDate = formatBookingDate(dateInput.value);

    openModal({
      bikeName,
      startDate,
      hours,
      total
    });
  });

  updateTotal();
});

const modal = document.querySelector("#booking-modal");
const modalBikeName = document.querySelector("#modal-bike-name");
const modalDate = document.querySelector("#modal-date");
const modalHours = document.querySelector("#modal-hours");
const modalTotal = document.querySelector("#modal-total");

/**
 * Данные бронирования.
 *
 * @typedef {Object} BookingData
 * @property {string} bikeName
 * @property {string} startDate
 * @property {number} hours
 * @property {number} total
 */

/**
 * Открывает модальное окно с информацией о бронировании.
 *
 * @param {BookingData} booking
 */
function openModal({ bikeName, startDate, hours, total }) {
  modalBikeName.textContent = bikeName;
  modalDate.textContent = startDate;
  modalHours.textContent = `${hours} ч.`;
  modalTotal.textContent = currencyFormatter.format(total);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

/**
 * Закрывает модальное окно.
 */
function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

/*
 * Закрытие по крестику, кнопке «Закрыть»
 * и клику по затемнённому оверлею.
 */
modal.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeModal);
});

/*
 * Закрытие по клавише Escape.
 */
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modal.classList.contains("is-open")
  ) {
    closeModal();
  }
});

/*
 * Интерактивная карта станций.
 */
const mapElement = document.querySelector("#map");

if (mapElement && typeof L !== "undefined") {
  /*
   * Координаты центра Москвы используются как пример.
   * Их можно заменить на координаты нужного города.
   */
  const cityCenter = [55.751244, 37.618423];

  const map = L.map("map", {
    scrollWheelZoom: false
  }).setView(cityCenter, 12);

  /*
   * Тёмная карта CARTO Dark Matter.
   *
   * Если у вас есть API-ключ CARTO, укажите его ниже.
   * Без ключа карта может отображаться с ограничениями провайдера.
   */
  const cartoApiKey = "";

  const cartoKeyQuery = cartoApiKey
    ? `?key=${cartoApiKey}`
    : "";

  L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyQuery}`,
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',

      subdomains: "abcd",
      maxZoom: 20
    }
  ).addTo(map);

  const stations = [
    {
      number: 1,
      coordinates: [55.751244, 37.618423]
    },
    {
      number: 2,
      coordinates: [55.760186, 37.618711]
    },
    {
      number: 3,
      coordinates: [55.744667, 37.603851]
    },
    {
      number: 4,
      coordinates: [55.735942, 37.627314]
    }
  ];

  stations.forEach((station) => {
    L.marker(station.coordinates)
      .addTo(map)
      .bindPopup(`Станция ВелоДрайв №${station.number}`);
  });
}
