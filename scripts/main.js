const _ = query => document.querySelector(query);
const $ = query => document.querySelectorAll(query);
const toast_delay = 3 * 1000; // 3 in seconds (same as css animation delay)

let body, splash, wishlist, cart, user, search, class_list, banner, offer;
let category_template, product_template, banner_right_arrow, banner_left_arrow;
let dot_indicator, search_result_container;
let max_allowed_category = 10,
  category_data = [],
  product_data = [],
  banner_data = [],
  banner_dot_elements = [],
  current_banner_index = 0,
  notification_queue = [],
  notification_added = 0;

const category_url = "../api/category.json";
const category_image_url = "./images/category";
const products_url = "../api/products.json";
const product_image_url = "./images/product";
const banner_url = "../api/banner.json";
const banner_image_url = "./images/banner";
const search_url = "../api/search.json";

window.onload = async () => {
  body = document.body;
  class_list = body.classList;

  splash = _(".splash");
  search = _(".search");
  banner = _(".banner");
  banner_left_arrow = _(".banner>.arrow.left");
  banner_right_arrow = _(".banner>.arrow.right");
  dot_indicator = _(".dot-indicator");
  search_result_container = _(".search-result-container");

  category_template = _("#category");
  category_container = _(".category-container");
  product_template = _("#product");
  product_container = _(".product-container");

  setSize();

  Array.from($(".option")).forEach(button => {
    button.addEventListener("click", goto_link);
  });
  Array.from($(".goto")).forEach(button => {
    button.addEventListener("click", open_link);
  });

  banner_left_arrow.addEventListener("click", banner_move_left);
  banner_right_arrow.addEventListener("click", banner_move_right);

  search.addEventListener("keyup", search_it);
  search.addEventListener("blur", close_search);

  load_category();
  load_products();
  load_banner();

  // Remove splash screen after loading page
  splash.parentNode.removeChild(splash);
};

window.onresize = setSize;

function setSize() {
  const width = body.clientWidth;
  const category_width = 100;
  max_allowed_category = parseInt(width / category_width);
  show_category_items();
  adjust_search_result_container();
}

function open_link(item) {
  let link = this.getAttribute("link");
  if (link != null) {
    window.open(link);
  } else {
    toast("Link not available", "warning");
  }
}

function goto_link(item) {
  let link = this.getAttribute("link");
  if (link != null) {
    window.location = link;
  } else {
    toast("Link not available", "warning");
  }
}

function show_category_items() {
  while (category_container.firstChild) {
    category_container.removeChild(category_container.firstChild);
  }
  data = category_data.slice(0, max_allowed_category - 1);
  data.push({
    name: "View More",
    image: "",
    link: "./categories"
  });
  data.forEach(category => {
    // cloning category template
    const item = category_template.cloneNode(true).content.children[0];
    item.setAttribute("link", category.link);
    item.querySelector(
      ".image"
    ).style.backgroundImage = `url("${category_image_url}/${category.image}")`;
    item.querySelector(".name").innerHTML = category.name;
    item.addEventListener("click", open_link);
    category_container.appendChild(item);
  });
}

function show_product_items() {
  const data = product_data;
  data.push({
    name: "View More",
    price: "",
    image: "",
    link: "./products"
  });
  data.forEach(product => {
    // cloning category template
    const item = product_template.cloneNode(true).content.children[0];
    item.setAttribute("link", product.link);
    item.querySelector(
      ".image"
    ).style.backgroundImage = `url("${product_image_url}/${product.image}")`;
    item.querySelector(".name").innerHTML = product.name;
    item.querySelector(".price").innerHTML = product.price.toLocaleString(
      "en-IN"
    ); // add commas to seperate according to indian rupee
    item.addEventListener("click", open_link);
    product_container.appendChild(item);
  });
}

function show_banner_items() {
  if (banner_data.length < 1) {
    toast("No banner data found", "warning");
    return;
  }
  const item = banner_data[current_banner_index];
  banner.style.backgroundImage = `url("${banner_image_url}/${item.image}")`;
  banner.setAttribute("link", item.link);
  const left_class = banner_left_arrow.classList,
    right_class = banner_right_arrow.classList;
  if (current_banner_index == 0) {
    left_class.add("disabled");
  } else {
    left_class.remove("disabled");
  }
  if (current_banner_index == banner_data.length - 1) {
    right_class.add("disabled");
  } else {
    right_class.remove("disabled");
  }
  change_dot_active_state();
}

const render_dots = () => {
  banner_data.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.setAttribute("index", i);
    dot.addEventListener("click", goto_banner);
    banner_dot_elements.push(dot);
    dot_indicator.appendChild(dot);
  });
};

function goto_banner(event) {
  event.stopPropagation();
  current_banner_index = parseInt(event.currentTarget.getAttribute("index"));
  show_banner_items();
}

const change_dot_active_state = () => {
  banner_dot_elements.forEach((dot, i) => {
    if (current_banner_index == i) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
};

const load_category = async () => {
  category_data =
    (await fetch_json(category_url).catch(error => {
      console.error(error);
      toast("Category loading Failed", "error");
    })) || [];
  show_category_items();
};

const load_products = async () => {
  product_data =
    (await fetch_json(products_url).catch(error => {
      console.error(error);
      toast("Product loading Failed", "error");
    })) || [];
  show_product_items();
};

const load_banner = async () => {
  banner_data =
    (await fetch_json(banner_url).catch(error => {
      console.error(error);
      toast("Banner loading Failed", "error");
    })) || [];
  render_dots();
  show_banner_items();
};

const banner_move_left = event => {
  event.stopPropagation();
  current_banner_index = Math.max(0, current_banner_index - 1);
  show_banner_items();
};

const banner_move_right = event => {
  event.stopPropagation();
  current_banner_index = Math.min(
    banner_data.length - 1,
    current_banner_index + 1
  );
  show_banner_items();
};

const toast = (message, type = "info") => {
  if (message instanceof Error) {
    console.error(message);
    message = message.message;
    type = "error";
  }
  const notification = document.createElement("div");
  notification.innerHTML = message;
  notification.classList.add("toast");
  notification.classList.add(type);
  notification_queue.push(notification);
  execute_notification_queue();
  setTimeout(execute_notification_queue, toast_delay);
};

const execute_notification_queue = () => {
  const time_difference = Date.now() - notification_added;
  console.log(time_difference, toast_delay, time_difference > toast_delay);
  if (time_difference > toast_delay) {
    const old_toast = _(".toast");
    if (old_toast != null) {
      notification_added = 0;
      body.removeChild(old_toast);
    }
    if (notification_queue.length > 0) {
      notification_added = Date.now();
      body.appendChild(notification_queue.shift());
      setTimeout(execute_notification_queue, toast_delay);
    }
  }
};

const fetch_json = async (url, method = "GET", cache = false) => {
  cache = cache ? "force-cache" : "no-store";
  return new Promise(async (resolve, reject) => {
    fetch(url, {
      method,
      cache
    })
      .then(async response => {
        if (response.status === 200) {
          return response.json().catch(reject);
        }
        throw new Error(`Status error : ${response.status}`);
      })
      .then(resolve)
      .catch(reject);
  });
};

const adjust_search_result_container = () => {
  const { bottom, width, left } = search.getBoundingClientRect();
  const result_style = search_result_container.style;
  result_style.top = `${bottom}px`;
  result_style.left = `${left}px`;
  result_style.width = `${width}px`;
};

const close_search = () => {
  search_result_container.style.display = "none";
};

const search_it = async event => {
  search_result_container.style.display = "block";
  const previous_value = search.getAttribute("previous-key") || "";
  const value = search.value || "";
  search.setAttribute("previous-key", value);
  // esc key
  if (event.keyCode == 27) {
    search.setAttribute("previous-key", "");
    search.value = "";
    close_search();
    return;
  }
  if (value == "") {
    close_search();
    return;
  }
  // same value but not enter key (enter key: force search)
  if (previous_value == value && event.keyCode != 13) {
    return; // same as previous value
  }
  // search
  const data =
    (await fetch_json(search_url).catch(error => {
      console.error(error);
      toast("Searching Failed", "error");
    })) || [];
  while (search_result_container.firstChild) {
    search_result_container.removeChild(search_result_container.firstChild);
  }

  data.forEach(item => {
    const result = document.createElement("div");
    result.classList.add("search-item");
    result.innerHTML = item.name.replaceAll(value, `<b>${value}</b>`);
    result.setAttribute("link", item.link);
    result.addEventListener("click", open_link);
    search_result_container.appendChild(result);
  });
};
