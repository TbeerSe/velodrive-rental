/**
 * Логика формы бронирования велосипеда: подсчёт стоимости, валидация часов,
 * открытие модалки с итоговыми данными.
 */

import { formatPrice, formatBookingDate, openModal } from "./modal.js";

/**
 * Инициализирует одну карточку велосипеда.
 * @param {HTMLElement} card
 */
function initBookingCard(card) {
  const hourlyPrice = Number(card.dataset.hourlyPrice) || 0;

  const hoursInput = card.querySelector(".hours-input");
  const dateInput = card.querySelector(".date-input");
  const totalPrice = card.querySelector(".total-price");
  const bookingForm = card.querySelector(".booking-form");
  const extraOptions = card.querySelectorAll(".extra-option");
  const bikeName = card.querySelector("h3")?.textContent.trim() ?? "—";

  if (!hoursInput || !totalPrice || !bookingForm) return;

  /** @returns {number} */
  function getOptionsPrice() {
    return [...extraOptions]
      .filter((opt) => opt.checked)
      .reduce((sum, opt) => sum + Number(opt.dataset.price || 0), 0);
  }

  /** @param {number} hours @returns {number} */
  function getTotal(hours) {
    return (hourlyPrice + getOptionsPrice()) * hours;
  }

  function updateTotal() {
    // Пока пользователь печатает пустое поле — не сбрасываем значение 1.
    if (hoursInput.value === "") return;

    const hours = Number(hoursInput.value);
    if (!Number.isFinite(hours) || hours <= 0) return;

    totalPrice.textContent = formatPrice(getTotal(hours));
  }

  /** Приводит значение часов к диапазону [min, max]. */
  function clampHours() {
    const min = Number(hoursInput.min) || 1;
    const max = Number(hoursInput.max) || 24;

    let hours = Number(hoursInput.value);
    if (!Number.isFinite(hours) || hours < min) hours = min;
    if (hours > max) hours = max;

    hoursInput.value = String(hours);
    updateTotal();
  }

  hoursInput.addEventListener("input", updateTotal);
  hoursInput.addEventListener("change", clampHours);
  hoursInput.addEventListener("blur", clampHours);

  extraOptions.forEach((opt) => opt.addEventListener("change", updateTotal));

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Проверка нативной валидации (required, min/max на дате).
    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    clampHours();

    const hours = Number(hoursInput.value);
    const total = getTotal(hours);
    const startDate = formatBookingDate(dateInput?.value ?? "");

    openModal({ bikeName, startDate, hours, total });
  });

  updateTotal();
}

/** Инициализирует все карточки велосипедов на странице. */
export function initBooking() {
  document.querySelectorAll(".bike-card").forEach(initBookingCard);
}
