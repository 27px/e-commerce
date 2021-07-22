const _ = query => document.querySelector(query);
const $ = query => document.querySelectorAll(query);
let body, splash, wishlist, cart, user, search, class_list, banner, offer;
let category_template, product_template;
const category_url = "../api/category.json";
const category_image_url = "./images/category";
const products_url = "../api/products.json";
const product_image_url = "./images/product";
let max_allowed_category = 10,
  category_data = [],
  product_data = [];

window.onload = () => {
  body = document.body;
  class_list = body.classList;
  // set_theme();
  splash = _(".splash");
  search = _("#search");
  wishlist = _("#wishlist");
  cart = _("#cart");
  user = _("#user");
  category_template = _("#category");
  category_container = _(".category-container");
  product_template = _("#product");
  product_container = _(".product-container");
  banner = _(".banner");
  offer = _(".offer");
  setSize();
  // theme_switcher = _("#theme-switcher");

  // Remove splash screen after loading page
  splash.parentNode.removeChild(splash);
  wishlist.addEventListener("click", open_wishlist);
  cart.addEventListener("click", open_cart);
  user.addEventListener("click", open_user);
  banner.addEventListener("click", load_banner);
  offer.addEventListener("click", load_offer);
  // theme_switcher.addEventListener("click", switch_theme);

  load_category();
  load_products();
};

window.onresize = setSize;

function setSize() {
  let width = body.clientWidth;
  let category_width = 100;
  max_allowed_category = parseInt(width / category_width);
  show_category_items();
}
let open_wishlist = () => {
  window.location = "/wishlist.html";
};
let open_cart = () => {
  window.location = "/cart.html";
};
let open_user = () => {
  window.location = "/user.html";
};
let load_banner = () => {
  window.location = "../sale";
};
let load_offer = () => {
  window.location = "../offer";
};
function open_link(item) {
  window.open(this.getAttribute("link"));
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
    let item = category_template.cloneNode(true).content.children[0];
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
  let data = product_data;
  data.push({
    name: "View More",
    price: "",
    image: "",
    link: "./products"
  });
  data.forEach(product => {
    // cloning category template
    let item = product_template.cloneNode(true).content.children[0];
    item.setAttribute("link", product.link);
    item.querySelector(
      ".image"
    ).style.backgroundImage = `url("${product_image_url}/${product.image}")`;
    item.querySelector(".name").innerHTML = product.name;
    item.querySelector(".price").innerHTML = product.price;
    item.addEventListener("click", open_link);
    product_container.appendChild(item);
  });
}
let load_category = async () => {
  let data = null;
  try {
    let response = await fetch(category_url);
    if (response.status !== 200) {
      throw new Error(`Status error ${resp.status}`);
    }
    data = await response.json();
  } catch (error) {
    console.log(error);
    data = [];
  } finally {
    category_data = data;
    show_category_items();
  }
};
let load_products = async () => {
  let data = null;
  try {
    let response = await fetch(products_url);
    if (response.status !== 200) {
      throw new Error(`Status error ${resp.status}`);
    }
    data = await response.json();
  } catch (error) {
    console.log(error);
    data = [];
  } finally {
    product_data = data;
    show_product_items();
  }
};

// let switch_theme = () => {
//   let theme;
//   if (class_list.contains("dark-theme")) {
//     class_list.add("light-theme");
//     class_list.remove("dark-theme");
//     theme = "light";
//   } else {
//     class_list.add("dark-theme");
//     class_list.remove("light-theme");
//     theme = "dark";
//   }
//   localStorage.setItem("theme", theme);
// };
// let set_theme = () => {
//   let theme = localStorage.getItem("theme") || "light";
//   if (theme == "light") {
//     class_list.add("light-theme");
//     class_list.remove("dark-theme");
//   } else {
//     class_list.add("dark-theme");
//     class_list.remove("light-theme");
//   }
// };
