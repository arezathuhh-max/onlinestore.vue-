<template>
  <div class="menu__icons">
    <div class="menu__icon">
      <img class="icons__img" src="/images/иконка1-svg.png" alt="" />
      <h4 class="icons__title">
        Быстрое послепродажное обслуживание <br />
        по электронной почте и телефону.
      </h4>
    </div>

    <div class="menu__icon">
      <img class="icons__img" src="/images/belarus (1).png" alt="" />
      <h4 class="icons__title">на рынке беларуси с 2001.г</h4>
    </div>

    <div class="menu__icon">
      <img class="icons__img" src="/images/иконка2-svg.png" alt="" />
      <h4 class="icons__title">
        Оригинальные творения и сделанный <br />
        по индивидуальному заказу
      </h4>
    </div>

    <div class="menu__icon">
      <img class="icons__img" src="/images/иконка3-svg (1).png" alt="" />
      <h4 class="icons__title">
        Произведенная продукция <br />
        ручная работа в беларуси
      </h4>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
      <nav class="footer__menu">
        <ul class="footer__menu-list">
          <li class="footer__menu-item0">
            <p class="footer__menu-title">навигация</p>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">католог</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">наши работы</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">адрес</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">наши контакты</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">о нас</a>
          </li>
        </ul>
        <ul class="footer__menu-list">
          <li class="footer__menu-item0">
            <p class="footer__menu-title">наши контакты</p>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">+375 29 6755573</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">запасной номер</a>
          </li>
          <li class="footer__menu-item">
            <a class="footer__menu-link" href="#">+375 29 6757738</a>
          </li>
        </ul>
        <ul class="footer__menu-list">
          <li class="footer__menu-item0">
            <p class="footer__menu-title">Связаться с нами</p>
          </li>
          <li class="footer__menu-item">
            <a href="" class="footer__menu-link">Светлана Васильевна Янковская</a>
          </li>
          <li class="footer__menu-item">
            <a href="" class="footer__menu-link">www.ramka.@email </a>
          </li>
          <li class="footer__menu-item">
            <a href="" class="footer__menu-link">+375 29 6755573</a>
          </li>
        </ul>
        <ul class="app">
          <li class="footer__menu-item0">
            <p class="footer__menu-title">наши социальные сети</p>
          </li>
          <li class="app__item">
            <a href="" class="app__item-link">
              <img class="app__item-img" src="/public/images/instagram.png" alt="" />
            </a>
          </li>
          <li class="app__item">
            <a href="" class="app__item-link">
              <img class="app__item-img" src="/public/images/telegram.png" alt="" />
            </a>
          </li>
          <li class="app__item">
            <a href="" class="app__item-link">
              <img class="app__item-img" src="/public/images/viber.png" alt="" />
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="footer__end">
      <p class="footer__end-text">
        регистрационныи номер 12378 2024 &#169; все права защищены <br />
        концевочка ппооро порвуа провалисьтика
      </p>
    </div>
    <div class="footer__copy">
      <p class="footer__copy-text">2024 &#169; все права защищены</p>
    </div>
  </footer>
</template>

<style>
/*icons*/

.menu__icons {
  display: flex;
  background-color: #fff;
  gap: 150px;
  justify-content: center;
  /*margin-bottom: 90px;*/
  margin-top: 30px;
}

.menu__icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 40px;
}
.icons__img {
  margin: 0 auto;
  padding-bottom: 10px;
}

.icons__title {
  color: #000;
  font-size: 12px;
  font-family: 'Times New Roman', Times, serif;
}

.icon_title {
  font-size: 16px;
  font-weight: 600;
}
.footer {
  background-color: rgb(35, 47, 62);
  padding: 50px 0px 0px;
  color: #fff;
}

.footer__copy {
  background-color: rgb(19, 26, 34);
  padding-bottom: 60px;
  padding-top: 50px;
}
.footer__copy-text {
  text-align: center;
}
.footer__menu {
  display: flex;
  justify-content: space-around;
  margin-bottom: 50px;
}
.footer__menu-list {
  min-width: 250px;
}

.footer__menu-title {
  font-size: 24px;
  font-weight: 700;
  padding-bottom: 20px;
}
.footer__menu-item {
  position: relative;
  display: table;
}
.footer__menu-item:hover {
  opacity: 0.5;
}
.footer__menu-item0 {
  position: relative;
}
.footer__menu-item::after {
  width: 100%;
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  opacity: 0;
  background-color: currentColor;
  transition: opacity 0.3s;
}
.footer__menu-item:hover::after {
  opacity: 1; /* ЛИНИЯ СТАНОВИТСЯ ВИДИМОЙ */
}

.footer__menu-item + .footer__menu-item {
  padding-top: 20px;
}
.footer__menu-item0 + .footer__menu-item {
  padding-top: 20px;
}

.app {
  /*display: flex;
  justify-content: center;
  gap: 40px;*/
  max-width: 250px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.app__item-img:hover {
  opacity: 0.5;
}

.footer__end {
  min-width: 800px;
  margin: 0 auto 30px;
  text-align: center;
}
</style>

<script></script>
