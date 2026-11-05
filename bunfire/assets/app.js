/* Bunfire — page behaviour: lineup, bag, checkout, the 9.00 stopwatch. */
(function () {
  "use strict";

  var DATA = window.BUNFIRE;
  var BAG_KEY = "bunfire.bag.v1";
  var ORDERS_KEY = "bunfire.orders.v1";

  function money(n) {
    return "₹" + n;
  }

  function productBySlug(slug) {
    return DATA.products.filter(function (p) {
      return p.slug === slug;
    })[0];
  }

  /* ------------------------------ bag state ------------------------------ */

  function readBag() {
    try {
      var parsed = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeBag(items) {
    var cleaned = items.filter(function (line) {
      return line.qty > 0 && productBySlug(line.slug);
    });
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(cleaned));
    } catch (e) {
      /* storage unavailable — the bag simply won't persist */
    }
    renderBag();
  }

  function bagLines() {
    return readBag()
      .map(function (line) {
        return { slug: line.slug, qty: line.qty, product: productBySlug(line.slug) };
      })
      .filter(function (line) {
        return !!line.product;
      });
  }

  function bagCount() {
    return bagLines().reduce(function (total, line) {
      return total + line.qty;
    }, 0);
  }

  function bagTotal() {
    return bagLines().reduce(function (total, line) {
      return total + line.product.price * line.qty;
    }, 0);
  }

  function addToBag(slug, qty) {
    var items = readBag();
    var existing = items.filter(function (line) {
      return line.slug === slug;
    })[0];
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ slug: slug, qty: qty });
    }
    writeBag(items);
  }

  function changeQty(slug, delta) {
    writeBag(
      readBag().map(function (line) {
        return line.slug === slug ? { slug: line.slug, qty: line.qty + delta } : line;
      })
    );
  }

  function removeLine(slug) {
    writeBag(
      readBag().filter(function (line) {
        return line.slug !== slug;
      })
    );
  }

  /* ------------------------------ drawer ------------------------------ */

  var drawerEls = {};

  function drawerMarkup() {
    return [
      '<div class="drawer-backdrop" data-bag-backdrop></div>',
      '<aside class="drawer" data-bag-drawer aria-label="Your bag" aria-hidden="true">',
      '  <div class="drawer-head">',
      '    <h2 data-drawer-title>Your bag</h2>',
      '    <button class="icon-btn" type="button" data-close-bag aria-label="Close bag">&times;</button>',
      "  </div>",
      '  <div class="drawer-body">',
      '    <div data-view="bag">',
      '      <div data-bag-lines></div>',
      '      <p class="bag-empty" data-bag-empty hidden>Your bag is empty. <a href="index.html#lineup">Pick a burger from the lineup</a>.</p>',
      "    </div>",
      '    <form class="checkout" data-view="checkout" hidden>',
      "      <h2>Checkout</h2>",
      '      <p class="checkout-total" data-checkout-total></p>',
      '      <div class="method">',
      '        <label><input type="radio" name="method" value="pickup" checked> Pickup</label>',
      '        <label><input type="radio" name="method" value="delivery"> Delivery</label>',
      "      </div>",
      '      <div class="field"><label for="co-name">Name</label><input id="co-name" name="name" required autocomplete="name"></div>',
      '      <div class="field"><label for="co-phone">Phone</label><input id="co-phone" name="phone" type="tel" required autocomplete="tel"></div>',
      '      <div class="field" data-address-field hidden><label for="co-address">Delivery address</label><textarea id="co-address" name="address"></textarea></div>',
      '      <div class="field"><label for="co-notes">Notes</label><input id="co-notes" name="notes" placeholder="No onions, extra sauce…"></div>',
      '      <p class="form-note">Pay at the counter. We will call if we need to reach you about this order.</p>',
      '      <div class="form-actions">',
      '        <button class="btn-primary grow" type="submit">Place order</button>',
      '        <button class="btn-ghost" type="button" data-back-to-bag>Back</button>',
      "      </div>",
      "    </form>",
      '    <div class="confirmation" data-view="confirmation" hidden></div>',
      "  </div>",
      '  <div class="drawer-foot" data-bag-foot>',
      '    <div class="total-row"><span>Subtotal</span><strong data-bag-total>₹0</strong></div>',
      '    <p class="foot-note">Collection in about 15 minutes · taxes included</p>',
      '    <button class="btn-primary full" type="button" data-start-checkout>Checkout</button>',
      "  </div>",
      "</aside>"
    ].join("");
  }

  function renderBag() {
    if (!drawerEls.lines) return;

    var lines = bagLines();
    var count = bagCount();

    document.querySelectorAll("[data-bag-count]").forEach(function (el) {
      el.textContent = count;
    });

    drawerEls.total.textContent = money(bagTotal());
    drawerEls.empty.hidden = lines.length > 0;
    drawerEls.checkoutBtn.disabled = lines.length === 0;

    drawerEls.lines.innerHTML = lines
      .map(function (line) {
        return [
          '<div class="bag-line">',
          '  <img src="' + line.product.image + '" alt="">',
          "  <div>",
          "    <h3>" + line.product.name + "</h3>",
          '    <p class="line-price">' + money(line.product.price) + " each</p>",
          "  </div>",
          '  <div class="line-end">',
          '    <div class="stepper">',
          '      <button type="button" data-dec="' + line.slug + '" aria-label="One less ' + line.product.name + '">&minus;</button>',
          "      <span>" + line.qty + "</span>",
          '      <button type="button" data-inc="' + line.slug + '" aria-label="One more ' + line.product.name + '">+</button>',
          "    </div>",
          '    <button type="button" class="remove" data-remove="' + line.slug + '">Remove</button>',
          "  </div>",
          "</div>"
        ].join("");
      })
      .join("");
  }

  function showView(name) {
    drawerEls.views.forEach(function (view) {
      view.el.hidden = view.name !== name;
    });
    drawerEls.foot.hidden = name !== "bag";
    drawerEls.title.textContent =
      name === "bag" ? "Your bag" : name === "checkout" ? "Checkout" : "Order placed";
  }

  function openBag() {
    showView("bag");
    renderBag();
    drawerEls.drawer.classList.add("open");
    drawerEls.backdrop.classList.add("open");
    drawerEls.drawer.setAttribute("aria-hidden", "false");
  }

  function closeBag() {
    drawerEls.drawer.classList.remove("open");
    drawerEls.backdrop.classList.remove("open");
    drawerEls.drawer.setAttribute("aria-hidden", "true");
  }

  function startCheckout() {
    if (!bagLines().length) return;
    var form = drawerEls.form;
    form.reset();
    form.method.value = "pickup";
    drawerEls.addressField.hidden = true;
    drawerEls.checkoutTotal.textContent = bagCount() + " items · " + money(bagTotal());
    showView("checkout");
    var name = form.querySelector("#co-name");
    if (name) name.focus();
  }

  function placeOrder(form) {
    var lines = bagLines();
    if (!lines.length) return;

    var method = form.method.value;
    var address = form.address.value.trim();
    if (method === "delivery" && !address) {
      form.address.focus();
      form.address.required = true;
      return;
    }

    var order = {
      id: "BF-" + String(Math.floor(Math.random() * 9000) + 1000),
      placedAt: new Date().toISOString(),
      method: method,
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      address: address,
      notes: form.notes.value.trim(),
      items: lines.map(function (line) {
        return { name: line.product.name, qty: line.qty, price: line.product.price };
      }),
      total: bagTotal()
    };

    try {
      var orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      /* order history is a convenience only */
    }

    drawerEls.confirmation.innerHTML = [
      "<h2>Order placed</h2>",
      '<p class="order-id">' + order.id + "</p>",
      "<p>Thanks " + order.name + " — " +
        (method === "pickup"
          ? "collect in about 15 minutes."
          : "we will deliver in about 30 minutes to " + order.address + ".") +
        "</p>",
      "<ul>",
      order.items
        .map(function (item) {
          return "<li><span>" + item.qty + " × " + item.name + "</span><span>" + money(item.price * item.qty) + "</span></li>";
        })
        .join(""),
      "</ul>",
      '<div class="total-row"><span>Total</span><strong>' + money(order.total) + "</strong></div>",
      '<button class="btn-primary full" type="button" data-close-bag style="margin-top:22px">Done</button>'
    ].join("");

    writeBag([]);
    showView("confirmation");
  }

  function initDrawer() {
    document.body.insertAdjacentHTML("beforeend", drawerMarkup());

    var drawer = document.querySelector("[data-bag-drawer]");
    var views = ["bag", "checkout", "confirmation"].map(function (name) {
      return { name: name, el: drawer.querySelector('[data-view="' + name + '"]') };
    });

    drawerEls = {
      drawer: drawer,
      backdrop: document.querySelector("[data-bag-backdrop]"),
      title: drawer.querySelector("[data-drawer-title]"),
      lines: drawer.querySelector("[data-bag-lines]"),
      empty: drawer.querySelector("[data-bag-empty]"),
      total: drawer.querySelector("[data-bag-total]"),
      foot: drawer.querySelector("[data-bag-foot]"),
      checkoutBtn: drawer.querySelector("[data-start-checkout]"),
      checkoutTotal: drawer.querySelector("[data-checkout-total]"),
      form: drawer.querySelector("form"),
      addressField: drawer.querySelector("[data-address-field]"),
      confirmation: drawer.querySelector("[data-view='confirmation']"),
      views: views
    };

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-open-bag]")) {
        event.preventDefault();
        openBag();
        return;
      }
      if (event.target.closest("[data-close-bag]")) {
        closeBag();
        return;
      }
      if (event.target.closest("[data-bag-backdrop]")) {
        closeBag();
        return;
      }
      if (event.target.closest("[data-start-checkout]")) {
        startCheckout();
        return;
      }
      if (event.target.closest("[data-back-to-bag]")) {
        showView("bag");
        return;
      }
      var dec = event.target.closest("[data-dec]");
      if (dec) {
        changeQty(dec.getAttribute("data-dec"), -1);
        return;
      }
      var inc = event.target.closest("[data-inc]");
      if (inc) {
        changeQty(inc.getAttribute("data-inc"), 1);
        return;
      }
      var remove = event.target.closest("[data-remove]");
      if (remove) {
        removeLine(remove.getAttribute("data-remove"));
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("open")) closeBag();
    });

    drawerEls.form.addEventListener("change", function (event) {
      if (event.target.name === "method") {
        var isDelivery = event.target.value === "delivery";
        drawerEls.addressField.hidden = !isDelivery;
        drawerEls.form.address.required = isDelivery;
      }
    });

    drawerEls.form.addEventListener("submit", function (event) {
      event.preventDefault();
      placeOrder(drawerEls.form);
    });

    renderBag();
  }

  /* ------------------------------ lineup ------------------------------ */

  function cardHtml(product) {
    var url = "menu.html?item=" + encodeURIComponent(product.slug);
    return [
      '<article class="card">',
      '  <a class="thumb" href="' + url + '">',
      '    <img src="' + product.image + '" alt="' + product.name + '" loading="lazy">',
      product.badge ? '    <span class="badge-float">' + product.badge + "</span>" : "",
      "  </a>",
      '  <div class="card-head">',
      "    <h3><a href=\"" + url + '">' + product.name + "</a></h3>",
      '    <span class="price">' + money(product.price) + "</span>",
      "  </div>",
      '  <p class="desc">' + product.description + "</p>",
      '  <div class="card-foot">',
      '    <span class="tag">' + product.tag + "</span>",
      '    <button class="add-btn" type="button" data-add="' + product.slug + '">Add</button>',
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderLineup(filter) {
    var grid = document.getElementById("lineup-grid");
    if (!grid) return;

    var visible = DATA.products.filter(function (product) {
      return filter === "all" || product.categories.indexOf(filter) !== -1;
    });

    grid.innerHTML = visible.length
      ? visible.map(cardHtml).join("")
      : '<p class="empty-state">Nothing in this bracket yet — try another filter.</p>';
  }

  function initLineup() {
    var filterBar = document.getElementById("filters");
    if (!filterBar) return;

    filterBar.innerHTML = DATA.filters
      .map(function (filter, index) {
        return (
          '<button class="filter" type="button" role="tab" data-filter="' + filter.id + '" aria-selected="' +
          (index === 0) + '">' + filter.label + "</button>"
        );
      })
      .join("");

    filterBar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      filterBar.querySelectorAll(".filter").forEach(function (el) {
        el.setAttribute("aria-selected", String(el === button));
      });
      renderLineup(button.getAttribute("data-filter"));
    });

    document.getElementById("lineup-grid").addEventListener("click", function (event) {
      var add = event.target.closest("[data-add]");
      if (!add) return;
      event.preventDefault();
      addToBag(add.getAttribute("data-add"), 1);
      openBag();
    });

    renderLineup("all");
  }

  /* ------------------------------ product page ------------------------------ */

  function initProductPage() {
    var root = document.getElementById("product");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var product = productBySlug(params.get("item"));

    if (!product) {
      root.innerHTML =
        '<a class="back-link" href="index.html#lineup">&larr; Back to the lineup</a>' +
        '<p class="empty-state">That burger is not on the menu. <a href="index.html#lineup">See the lineup</a>.</p>';
      return;
    }

    document.title = product.name + " — Bunfire";

    root.innerHTML = [
      '<a class="back-link" href="index.html#lineup">&larr; Back to the lineup</a>',
      '<div class="product-grid">',
      '  <div class="product-media">',
      '    <img src="' + product.image + '" alt="' + product.name + '">',
      "  </div>",
      '  <div class="product-info">',
      '    <span class="tag">' + product.tag + "</span>",
      "    <h1>" + product.name + "</h1>",
      '    <p class="product-desc">' + product.description + "</p>",
      product.heat ? '    <p class="heat-note">Brings heat</p>' : "",
      '    <div class="chips">' +
        product.ingredients
          .map(function (ingredient) {
            return '<span class="chip">' + ingredient + "</span>";
          })
          .join("") +
        "</div>",
      '    <div class="product-buy">',
      '      <span class="product-price">' + money(product.price) + "</span>",
      '      <div class="stepper">',
      '        <button type="button" data-step="-1" aria-label="One less">&minus;</button>',
      '        <span data-qty>1</span>',
      '        <button type="button" data-step="1" aria-label="One more">+</button>',
      "      </div>",
      '      <button class="btn-primary" type="button" data-add-product>Add to bag</button>',
      "    </div>",
      '    <p class="product-note">Collection in about 15 minutes · Delivery available at checkout.</p>',
      "  </div>",
      "</div>"
    ].join("");

    var qtyEl = root.querySelector("[data-qty]");
    var qty = 1;

    root.querySelectorAll("[data-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        qty = Math.max(1, qty + Number(button.getAttribute("data-step")));
        qtyEl.textContent = qty;
      });
    });

    root.querySelector("[data-add-product]").addEventListener("click", function () {
      addToBag(product.slug, qty);
      openBag();
    });
  }

  /* ------------------------------ stopwatch ------------------------------ */

  function winningCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 4; i += 1) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return "B9-" + code;
  }

  function initStopwatch() {
    var secondsEl = document.getElementById("sw-seconds");
    if (!secondsEl) return;

    var hundredthsEl = document.getElementById("sw-hundredths");
    var toggle = document.getElementById("sw-toggle");
    var result = document.getElementById("sw-result");
    var frame = 0;
    var startedAt = 0;
    var running = false;

    function paint(hundredths) {
      secondsEl.textContent = String(Math.floor(hundredths / 100));
      hundredthsEl.textContent = String(hundredths % 100).padStart(2, "0");
    }

    function tick() {
      paint(Math.floor((performance.now() - startedAt) / 10));
      frame = requestAnimationFrame(tick);
    }

    function start() {
      running = true;
      startedAt = performance.now();
      result.hidden = true;
      result.className = "timer-result";
      toggle.textContent = "Stop the clock";
      toggle.classList.add("is-running");
      paint(0);
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
      var hundredths = Math.floor((performance.now() - startedAt) / 10);
      paint(hundredths);
      toggle.textContent = "Try again";
      toggle.classList.remove("is-running");

      if (hundredths === 900) {
        result.className = "timer-result is-win";
        result.innerHTML =
          "Nailed it — exactly 9.00. Show this code at the counter:<br><code>" +
          winningCode() +
          "</code>";
      } else {
        var difference = hundredths - 900;
        result.className = "timer-result";
        result.innerHTML =
          "You stopped at <strong>" +
          (hundredths / 100).toFixed(2) +
          "</strong> — " +
          Math.abs(difference) +
          " hundredths " +
          (difference < 0 ? "early" : "late") +
          ". Try again.";
      }
      result.hidden = false;
    }

    toggle.addEventListener("click", function () {
      if (running) {
        stop();
      } else {
        start();
      }
    });

    paint(0);
  }

  /* ------------------------------ boot ------------------------------ */

  function boot() {
    initDrawer();
    initLineup();
    initProductPage();
    initStopwatch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
