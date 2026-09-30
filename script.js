const units = [
  { name: "B'AK'TUN", days: 144000 },
  { name: "K'ATUN", days: 7200 },
  { name: "TUN", days: 360 },
  { name: "WINAL", days: 20 },
  { name: "K'IN", days: 1 }
];

const readout = document.querySelector("#readout");
const inspection = document.querySelector("#inspection");
const inspectionUnit = document.querySelector(".inspection-unit");
const inspectionValue = document.querySelector(".inspection-value");
const inspectionDays = document.querySelector(".inspection-days");
const convert = document.querySelector("#convert");
const totalDays = document.querySelector("#totalDays");
const totalYears = document.querySelector("#totalYears");

let longCount = [];
let conversionStage = 0; // 0 = null, 1 = total, 2 = decomposition
let selectedIndex = null;
let traceIndex = null;
let lastDateKey = "";

function gregorianToJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045;
}

function getCurrentLongCount() {
  const now = new Date();
  const jdn = gregorianToJdn(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  let remainder = jdn - 584283;

  const baktun = Math.floor(remainder / 144000);
  remainder %= 144000;

  const katun = Math.floor(remainder / 7200);
  remainder %= 7200;

  const tun = Math.floor(remainder / 360);
  remainder %= 360;

  const winal = Math.floor(remainder / 20);
  const kin = remainder % 20;

  return [baktun, katun, tun, winal, kin];
}

function getDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function buildReadout() {
  readout.innerHTML = "";

  const longCountEl = document.createElement("span");
  longCountEl.className = "long-count";

  longCount.forEach((value, index) => {
    const wrapper = document.createElement("span");
    wrapper.className = "part-wrapper";
    wrapper.dataset.index = index;

    const info = document.createElement("span");
    info.className = "part-info";

    const unit = document.createElement("span");
    unit.className = "part-unit";
    unit.textContent = units[index].name;

    const traceBlock = document.createElement("span");
    traceBlock.className = "part-trace";

    const traceMult = document.createElement("span");
    traceMult.className = "part-trace-mult";

    const traceTotal = document.createElement("span");
    traceTotal.className = "part-trace-total";

    traceBlock.append(traceMult, traceTotal);
    info.append(unit, traceBlock);

    const contribution = document.createElement("span");
    contribution.className = "part-days";
    const days = value * units[index].days;
    contribution.textContent =
      `${days.toLocaleString()} DAY${days === 1 ? "" : "S"}`;

    const part = document.createElement("span");
    part.className = "part";
    part.textContent = value;
    part.setAttribute("tabindex", "0");
    part.setAttribute("role", "button");
    part.setAttribute("aria-label", `${units[index].name}, value ${value}`);

    wrapper.append(info, part, contribution);
    longCountEl.appendChild(wrapper);

    if (index < longCount.length - 1) {
      const separator = document.createElement("span");
      separator.className = "separator";
      separator.textContent = ".";
      longCountEl.appendChild(separator);
    }

    wrapper.addEventListener("mouseenter", () => inspect(index));
    wrapper.addEventListener("mouseleave", () => {
      if (traceIndex === null) clearInspection();
    });

    part.addEventListener("focus", () => inspect(index));
    part.addEventListener("blur", () => {
      if (traceIndex === null) clearInspection();
    });

    part.addEventListener("click", (event) => {
      event.stopPropagation();
      trace(index);
    });
  });

  const clock = document.createElement("span");
  clock.className = "clock";
  clock.id = "clock";

  readout.append(longCountEl, document.createTextNode(" "), clock);

  if (selectedIndex !== null) {
    applySelectionState();
  }
}

function inspect(index) {
  if (traceIndex !== null && traceIndex !== index) {
    traceIndex = null;
  }

  selectedIndex = index;
  applySelectionState();
}

function trace(index) {
  if (traceIndex === index) {
    traceIndex = null;
    selectedIndex = index;
    applySelectionState();
    return;
  }

  traceIndex = index;
  selectedIndex = index;
  applySelectionState();
}

function applySelectionState() {
  document.querySelectorAll(".part-wrapper").forEach((wrapper, index) => {
    wrapper.classList.toggle("active", index === selectedIndex);
    wrapper.classList.toggle("trace", index === traceIndex);
    wrapper.classList.toggle(
      "dimmed",
      selectedIndex !== null && index !== selectedIndex
    );

    if (index === traceIndex) {
      const value = longCount[index];
      const unitDays = units[index].days;
      const contribution = value * unitDays;
      const mult = wrapper.querySelector(".part-trace-mult");
      const total = wrapper.querySelector(".part-trace-total");
      mult.textContent = `${value} × ${unitDays.toLocaleString()}`;
      total.textContent = `= ${contribution.toLocaleString()} DAYS`;
    } else {
      const mult = wrapper.querySelector(".part-trace-mult");
      const total = wrapper.querySelector(".part-trace-total");
      if (mult) mult.textContent = "";
      if (total) total.textContent = "";
    }
  });

  if (selectedIndex === null) {
    clearInspection();
    return;
  }

  const unit = units[selectedIndex];
  const value = longCount[selectedIndex];
  const contribution = value * unit.days;

  inspectionUnit.textContent = unit.name;
  inspectionValue.textContent = String(value);
  inspectionDays.textContent =
    `${contribution.toLocaleString()} DAY${contribution === 1 ? "" : "S"}`;

  inspection.classList.add("visible");

  if (traceIndex !== null) {
    inspection.classList.add("tracing");
  } else {
    inspection.classList.remove("tracing");
  }

  document.body.classList.toggle("is-tracing", traceIndex !== null);
}

function clearInspection() {
  selectedIndex = null;
  traceIndex = null;

  document.querySelectorAll(".part-wrapper").forEach(wrapper => {
    wrapper.classList.remove("active", "dimmed", "trace");
  });

  inspection.classList.remove("visible", "tracing");
  document.body.classList.remove("is-tracing");
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.querySelector("#clock").textContent = `${hours}:${minutes}`;
}

function updateCalendar() {
  const currentDateKey = getDateKey();

  if (currentDateKey === lastDateKey) return;

  lastDateKey = currentDateKey;
  longCount = getCurrentLongCount();

  selectedIndex = null;
  traceIndex = null;
  buildReadout();

  if (conversionStage > 0) updateConversion();
}

function calculateTotalDays() {
  return longCount.reduce(
    (sum, value, index) => sum + value * units[index].days,
    0
  );
}

function updateConversion() {
  const days = calculateTotalDays();
  const solarYear = 365.2422;
  const years = days / solarYear;

  if (conversionStage === 1) {
    totalDays.textContent = days.toLocaleString();
    totalYears.textContent = `≈ ${years.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} SOLAR YEARS`;
    convert.classList.remove("decomposed");
  }

  if (conversionStage === 2) {
    const expression = longCount
      .map((value, index) => `${value} × ${units[index].days.toLocaleString()}`)
      .join("  +  ");

    totalDays.textContent = expression;
    totalYears.textContent = `= ${days.toLocaleString()} DAYS  ·  ≈ ${years.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} SOLAR YEARS`;

    convert.classList.add("decomposed");
  }
}

function cycleConversion() {
  conversionStage = (conversionStage + 1) % 3;

  if (conversionStage === 0) {
    totalDays.textContent = "—";
    totalYears.textContent = "—";
    convert.classList.remove("is-revealed", "decomposed");
    convert.setAttribute("aria-expanded", "false");
    convert.setAttribute("data-stage", "null");
    return;
  }

  updateConversion();
  convert.classList.add("is-revealed");
  convert.setAttribute("aria-expanded", "true");
  convert.setAttribute(
    "data-stage",
    conversionStage === 1 ? "total" : "decomposition"
  );
}

updateCalendar();
updateClock();

setInterval(() => {
  updateClock();
  updateCalendar();
}, 1000);

convert.addEventListener("click", cycleConversion);
convert.setAttribute("aria-expanded", "false");
convert.setAttribute("data-stage", "null");
