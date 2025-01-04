// script.js
document.addEventListener("DOMContentLoaded", () => {
  const openSidebar = document.getElementById("open-sidebar");
  const closeSidebar = document.getElementById("close-sidebar");
  const sidebar = document.getElementById("sidebar");

  openSidebar.addEventListener("click", (e) => {
    e.preventDefault();
    sidebar.classList.add("open"); // Προσθέτουμε την κλάση για να εμφανιστεί το sidebar
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open"); // Αφαιρούμε την κλάση για να κρυφτεί το sidebar
  });
});

document.querySelectorAll('.dropdown-submenu > div').forEach((menuTitle) => {
  menuTitle.addEventListener('click', () => {
    const parentLi = menuTitle.parentElement;
    parentLi.classList.toggle('open');
  });
});

document.querySelectorAll('.submenu-content li a').forEach((link) => {
  link.addEventListener('click', (e) => {
    document
      .querySelectorAll('.submenu-content li a')
      .forEach((el) => el.classList.remove('active'));
    e.target.classList.add('active');
  });
});

// Επιλογή των κουμπιών και του sidebar
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('#sidebar');
const closeSidebar = document.querySelector('#close-sidebar');

// Ενεργοποίηση του Hamburger Menu
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open'); // Ανοίγει/κλείνει το sidebar
});

// Κλείσιμο του sidebar
closeSidebar.addEventListener('click', () => {
  sidebar.classList.remove('open'); // Κλείνει το sidebar
});
