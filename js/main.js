/**
 * Точка входа приложения.
 * Подключает функциональные модули в нужном порядке.
 */

import { initBooking } from "./booking.js";
import { initMap } from "./map.js";

initBooking();
initMap();
