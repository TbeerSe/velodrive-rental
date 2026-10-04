/**
 * Модальное окно подтверждения бронирования.
 * Экспортирует публичный API: formatPrice, formatBookingDate, openModal, closeModal.
 */

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const modal = document.querySelector("#booking-modal");
const modalBikeName = document.querySelector("#modal-bike-name");
const modalDate = document.querySelector("#modal-date");
const modalHours = document.querySelector("#modal-hours");
const modalTotal = document.querySelector("#modal-total");

/** Элемент, который был в фокусе до открытия — чтобы вернуть фокус после закрытия. */
let lastFocusedElement = null;

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPrice(value) {
  return currencyFormatter.format(value);
}

/**
 * Преобразует значение input[type="datetime-local"] в человекочитаемую строку.
 * @param {string} value
 * @returns {string}
 */
export function formatBookingDate(value) {
  if (!value) return "—";

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-");
  return `${day}.${month}.${year}, ${timePart}`;
}

/**
 * @typedef {Object} BookingData
 * @property {string} bikeName
 * @property {string} startDate
 * @property {number} hours
 * @property {number} total
 */

/**
 * Открывает модальное окно с деталями бронирования.
 * @param {BookingData} booking
 */
export function openModal({ bikeName, startDate, hours, total }) {
  if (!modal) return;

  lastFocusedElement = document.activeElement;

  modalBikeName.textContent = bikeName;
  modalDate.textContent = startDate;
  modalHours.textContent = `${hours} ч.`;
  modalTotal.textContent = currencyFormatter.format(total);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const focusTarget = modal.querySelector(".modal__close");
  if (focusTarget) focusTarget.focus();
}

/**
 * Закрывает модальное окно и возвращает фокус на триггер.
 */
export function closeModal() {
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

/** Инициализация обработчиков (закрытие по клику/Esc, focus trap). */
function initModal() {
  if (!modal) return;

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

initModal();
