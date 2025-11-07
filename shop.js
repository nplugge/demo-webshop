const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Grape", emoji: "🍋" },
};

function normalizeBasketItems(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const asStrings = items.every((item) => typeof item === "string");
  if (asStrings) {
    return items.reduce((acc, product) => {
      if (typeof product !== "string") return acc;
      const existing = acc.find((entry) => entry.product === product);
      if (existing) {
        existing.quantity += 1;
      } else {
        acc.push({ product, quantity: 1 });
      }
      return acc;
    }, []);
  }

  return items
    .filter(
      (item) =>
        item &&
        typeof item.product === "string" &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    )
    .map((item) => ({
      product: item.product,
      quantity: Math.floor(item.quantity),
    }));
}

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return normalizeBasketItems(parsed);
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function saveBasket(basket) {
  localStorage.setItem("basket", JSON.stringify(basket));
}

function addToBasket(product) {
  const basket = getBasket();
  const existing = basket.find((item) => item.product === product);
  if (existing) {
    existing.quantity += 1;
  } else {
    basket.push({ product, quantity: 1 });
  }
  saveBasket(basket);
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach(({ product, quantity }) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${quantity}x ${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  const totalQuantity = basket.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity > 0) {
    indicator.textContent = totalQuantity;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
