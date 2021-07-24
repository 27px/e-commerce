const _ = query => document.querySelector(query);
const $ = query => document.querySelectorAll(query);

let body, splash, wishlist, cart, user, search, class_list, banner, offer;
let category_template, product_template, banner_right_arrow, banner_left_arrow;
let dot_indicator;
let max_allowed_category = 10;
let category_data = [];
let product_data = [];
let banner_data = [];
let banner_dot_elements=[];
let current_banner_index = 0;

const category_url = "../api/category.json";
const category_image_url = "./images/category";
const products_url = "../api/products.json";
const product_image_url = "./images/product";
const banner_url = "../api/banner.json";
const banner_image_url = "./images/banner";

window.onload = async () => {
  body = document.body;
  class_list = body.classList;

  splash = _(".splash");
  search = _(".search");
  banner = _(".banner");
  banner_left_arrow = _(".banner>.arrow.left");
  banner_right_arrow = _(".banner>.arrow.right");
  dot_indicator = _(".dot-indicator");

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

  load_category();
  load_products();
  load_banner();

  // Remove splash screen after loading page
  splash.parentNode.removeChild(splash);
};

window.onresize = setSize;

function setSize() {
  let width = body.clientWidth;
  let category_width = 100;
  max_allowed_category = parseInt(width / category_width);
  show_category_items();
}

function open_link(item) {
  window.open(this.getAttribute("link"));
}

function goto_link(item) {
  window.location = this.getAttribute("link");
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
    item.querySelector(".price").innerHTML = product.price.toLocaleString(
      "en-IN"
    ); // add commas to seperate according to indian rupee
    item.addEventListener("click", open_link);
    product_container.appendChild(item);
  });
}

function show_banner_items() {
  let item = banner_data[current_banner_index];
  banner.style.backgroundImage = `url("${banner_image_url}/${item.image}")`;
  banner.setAttribute("link", item.link);
  let left_class = banner_left_arrow.classList,
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

let render_dots = () => {
  banner_data.forEach((_, i) => {
    let dot = document.createElement("div");
    dot.classList.add("dot");
    dot.setAttribute("index", i);
    dot.addEventListener("click", goto_banner);
    banner_dot_elements.push(dot);
    dot_indicator.appendChild(dot);
  });
};

function goto_banner(event) {
  event.stopPropagation();
  current_banner_index=parseInt(event.currentTarget.getAttribute("index"));
  show_banner_items();
}

let change_dot_active_state = () => {
  banner_dot_elements.forEach((dot,i)=>{
    if(current_banner_index==i) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
};

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

let load_banner = async () => {
  let data = null;
  try {
    let response = await fetch(banner_url);
    if (response.status !== 200) {
      throw new Error(`Status error ${resp.status}`);
    }
    data = await response.json();
  } catch (error) {
    console.log(error);
    data = [];
  } finally {
    banner_data = data;
    render_dots();
    show_banner_items();
  }
};

let banner_move_left = event => {
  event.stopPropagation();
  current_banner_index = Math.max(0, current_banner_index - 1);
  show_banner_items();
};

let banner_move_right = event => {
  event.stopPropagation();
  current_banner_index = Math.min(
    banner_data.length - 1,
    current_banner_index + 1
  );
  show_banner_items();
};
