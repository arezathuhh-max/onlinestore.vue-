<script setup>
import { ref } from 'vue'

// 1. Создаем реактивную переменную (по умолчанию 5)
const selectedCount = ref(5)

// 2. Функция, которая будет менять это число
const setColumns = (num) => {
  selectedCount.value = num
}

const isFilterOpen = ref(true)
const isFilterOpen2 = ref(true)

const isFilterOpen3 = ref(true)
const isFilterOpen4 = ref(true)
</script>

<template>
  <main class="main">
    <section class="catalog">
      <div class="container4">
        <div class="catalog__content">
          <div class="container4">
            <div class="catalog__filters">
              <button class="hide__filters btn__rest">скрыть параметры</button>

              <div class="catalog__filter" :class="{ 'catalog__filter--open': isFilterOpen }">
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">категории</h3>
                    <span class="catalog__filter-qantity qantity">1</span>
                  </div>
                  <span class="catalog__filter-toggle" @click="isFilterOpen = !isFilterOpen"></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">все категории</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> фооторамки: </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">пользовательские </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text"> беспорядочные</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">деревянные</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item"></li>
                    <label class="custom__checkbox" data-text="clothes">
                      <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                      <span class="custom__checkbox-text">уголки</span>
                    </label>

                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">новинки </span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">бестселлеры</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">фильмы и сериалы</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">паспорту</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">стекла</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="catalog__filter" :class="{ 'catalog__filter--open': isFilterOpen2 }">
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">цвет</h3>
                    <span class="catalog__filter-qantity qantity">2</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen2 = !isFilterOpen2"
                  ></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Accessories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">dresses</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">coats</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">clothes</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">t-shirt</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">summer</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">jacket</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">short</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="catalog__filter" :class="{ 'catalog__filter--open': isFilterOpen3 }">
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">размер</h3>
                    <span class="catalog__filter-qantity qantity">3</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen3 = !isFilterOpen3"
                  ></span>
                </div>
                <div class="catalog__filter-bottom">
                  <ul class="catalog-filter__items">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Accessories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">dresses</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">coats</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">clothes</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="t-shirt">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">t-shirt</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="all categories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">all categories</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="summer">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">summer</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="jacket">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">jacket</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="short">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">short</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="catalog__filter" :class="{ 'catalog__filter--open': isFilterOpen4 }">
                <div class="catalog__filter-top">
                  <div class="catalog__filter-caption">
                    <h3 class="catalog__filter-title">скидки</h3>
                    <span class="catalog__filter-qantity qantity">4</span>
                  </div>
                  <span
                    class="catalog__filter-toggle"
                    @click="isFilterOpen4 = !isFilterOpen4"
                  ></span>
                </div>
                <div class="catalog__filter-bottom catalog-filter--columns">
                  <ul class="catalog-filter__items catalog-filter--columns">
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="Accessories">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">70% и выше</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="dresses">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Скидка 60%-70%</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="coats">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">Скидка 40%-60%</span>
                      </label>
                    </li>
                    <li class="catalog__filter-item">
                      <label class="custom__checkbox" data-text="clothes">
                        <input type="checkbox" class="custom__checkbox-input visual-hidden" />
                        <span class="custom__checkbox-text">скидка менее 40%</span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="catalog__grid">
              <div class="catalog__grid-props catalog-props">
                <div class="catalog-props__top">
                  <div class="catalog-props__calumns catalog-colums">
                    <span class="catalog-calumns__text"> количество колонок </span>
                    <ul class="catalog-colums-list">
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(3)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 3 }"
                          data-grid-colums="3"
                        >
                          3
                        </button>
                      </li>
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(4)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 4 }"
                          data-grid-colums="4"
                        >
                          4
                        </button>
                      </li>
                      <li class="catalog-colums__item">
                        <button
                          @click="setColumns(5)"
                          class="btn-reset main-link catalog__columns-btn"
                          :class="{ 'catalog__columns-btn--current': selectedCount === 5 }"
                          data-grid-colums="5"
                        >
                          5
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div class="custom-select" tabindex="0">
                    <div class="custom-select__top">сортировать по последним</div>
                    <div class="custom-select__dropdown">
                      <ul class="custom-select__list">
                        <li class="custom-select__item">сортировать по последним</li>
                        <li class="custom-select__item">сортировать по цене</li>

                        <li class="custom-select__item">сортировать по новым</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="catalog-props__choice catalog-choice">
                <button class="btn-reset catalog-choice__item">
                  Accessories

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 26 26"
                  >
                    <path
                      d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"
                    ></path>
                  </svg>
                </button>

                <button class="btn-reset catalog-choice__item">
                  28
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 26 26"
                  >
                    <path
                      d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"
                    ></path>
                  </svg>
                </button>
                <button class="btn-reset catalog-choice__clear">clear all</button>
              </div>
              <ul class="catalog-grid__content" :data-grid-colums="selectedCount">
                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product-prop product__prop new">новинка</span>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <span class="product__sale">скидка</span>
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product__prop2 sales">скидка</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>

                    <span class="product__oldprice">$210.00</span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product-prop product__prop best">Хит продаж</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <span class="product__sale">скидка</span>
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product__prop2 sales">скидка</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>

                    <span class="product__oldprice">$210.00</span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product-prop product__prop new">новинка</span>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <span class="product__sale">скидка</span>
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product__prop2 sales">скидка</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>

                    <span class="product__oldprice">$210.00</span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product-prop product__prop best">Хит продаж</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>
                  </article>
                </li>

                <li class="catalog__grid-item">
                  <article class="product">
                    <div class="product__image">
                      <span class="product__sale">скидка</span>
                      <img src="/images/works22 (1) (2) (3).png" alt="product-1" />
                    </div>
                    <span class="product__prop2 sales">скидка</span>

                    <h3 class="product__title">
                      <router-link class="catalog_link_color"> Eyes Mesh Boat Shoes </router-link>
                    </h3>

                    <span class="product__price">$220.00 </span>

                    <span class="product__oldprice">$210.00</span>
                  </article>
                </li>
              </ul>

              <ul class="pagination">
                <li class="pagination__item">
                  <router-link class="pagination__link pagination__link--current">1</router-link>
                </li>
                <li class="pagination__item">
                  <router-link class="pagination__link">2 </router-link>
                </li>

                <li class="pagination__item">
                  <router-link class="pagination__link">3</router-link>
                </li>

                <li class="pagination__item">
                  <a href="#" class="pagination__link"
                    >дальше

                    <img src="/images/right (1).png" alt="" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
/*.container4 {
  max-width: 1406px;
  padding: 0 40px;
  margin: 0 auto;
}

.catalog__content {
  min-height: 500px;
}

.catalog__content .container4 {
  display: flex;
}
.catalog__filters {
  width: 309px;
  padding-top: 27px;
  padding-right: 62px;
  border-top: 1px solid #eee;
  margin-right: 30px;
}*/
/*catalog***************/
.product__image {
  overflow: hidden;
  position: relative;
  max-height: 100%;
  object-fit: cover;
  margin-bottom: 20px;
}
.product__sale {
  position: absolute;
  left: 20px;
  top: 20px;
  border: 2px solid #151515;

  color: #111;

  text-transform: uppercase;
  background: #ff4d4d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}
.catalog_link_color {
  color: #000;
}
.sales {
  background-image: url(../images/sale-tag.png);
}

.product__prop2 {
  display: inline-block;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.best {
  background-image: url(../images/best-seller.png);
}

.product__oldprice {
  font-weight: 700;
  font-size: 13px;
  color: #959595;
  text-decoration: line-through;
  margin-left: 5px;
}
.new {
  background-image: url(../images/new1.png);
}

.product-prop {
  display: inline-block;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  color: #111;
  background-position: left center;
  background-repeat: no-repeat;
  padding-left: 16px;
}
.product__title {
  color: #454545;
  font-family: sans-serif;
  font-size: 13px;
  margin: 0;
  margin-bottom: 8px;
}
.product__price {
  width: 55px;
  height: 13px;
  color: #151515;
  font-weight: 700;
  font-size: 13px;
}
.catalog {
  padding-top: 220px; /* или другое значение, чтобы «отлепить» от верха */
}
.breadcrumbs__list {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-top: 36px;
  padding-bottom: 26px;
}
.breadcrumbs__item {
  position: relative;
}
.breadcrumbs__item::after {
  content: '/';
  position: absolute;
  right: -20px;
  top: 50%;
  color: #585858;
  font-size: 10px;
  text-transform: uppercase;
  transform: translateY(-50%);
}

.breadcrumbs__item:not(:last-child) {
  margin-right: 35px;
}

.breadcrumbs {
  color: #858585;
  font-family:
    'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.breadcrumbs__link {
  font-size: 10px;
  text-transform: uppercase;
  color: gray;
  transition: color 0.3s;
}
.breadcrumbs__link:hover {
  color: #000;
  transition: color 0.3s;
}
.breadcrumbs__link--current {
  color: #000;
}

/*catalog filter*****************/

.catalog__filters {
  width: 309px;
  padding-top: 27px;
  padding-right: 62px;

  border-top: 1px solid #eee;
  margin-right: 30px;
}

.catalog__filter {
  border-top: 1px solid #eee;
}

.catalog__filter-top {
  display: flex;
  justify-content: space-between;
  padding-top: 34px;
  padding-bottom: 34px;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

/*display: flex;
   align-items: center;*/

.catalog__filter-title {
  display: inline-block;
  margin: 0;
}

.catalog__filter--open {
  display: block;
}

.catalog__filter--open .catalog__filter-bottom {
  display: block;
}

.catalog__filter--open .catalog__filter-toggle::before {
  display: none;
}

.catalog__filter-qantity {
  min-width: 16px;
  margin-left: 5px;
  transform: translateY(-1px);
}
.catalog-filter:last-child {
  border-bottom: 1px solid #eee;
}
.qantity {
  display: inline-flex;
  align-items: center;
  border-radius: 25px;
  padding: 0 5px;
  height: 16px;
  font-weight: 700;
  font-size: 10px;
  color: #fff;
  background-color: #000;
}

.catalog__filter-bottom {
  display: none;

  padding-bottom: 34px;
}

.hide__filters {
  color: #151515;
  font-family:
    'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,
    sans-serif;
  padding-left: 24px;
  background-image: url('/images/close\ \(1\).png');
  background-repeat: no-repeat;
  background-position: left center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border: 0;
  background-color: #fff;
  margin-bottom: 18px;
}

.catalog__filter-toggle {
  position: relative;
  width: 12px;
  height: 12px;
  color: #aaa;
}

.catalog-filter__items {
  columns: 2;
}
.catalog-filter--columns {
  columns: 1;
}
.catalog-filter__item {
  margin-bottom: 14px;
}

.catalog-filter__item:nth-child(5n) {
  margin-bottom: 0;
}
.catalog__filter-toggle::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: currentColor;
  transform: translateX(-50%);
}

.catalog__filter-toggle::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  width: 100%;
  background-color: currentColor;
  transform: translateY(-50%);
}

/*pagination*/

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination__item:not(:last-child) {
  margin-right: 8px;
}

.pagination__link {
  display: inline-flex;
  align-items: center;
  color: #858585;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid #eee;
  padding: 0 16px;
  height: 40px;
  text-transform: uppercase;

  transition:
    color 0.3s,
    background-color 0.3s,
    border 0.3s;
}
.pagination__link:hover {
  border: 2px solid #000;
  background-color: #000;
  color: #fff;
  transition:
    color 0.3s,
    background-color 0.3s,
    border 0.3s;
}

.pagination__link--current {
  border: 2px solid #000;

  background-color: #000;
  color: #fff;
}

.pagination__item img {
  margin-left: 3px;
  width: 10px;
  height: 10px;
  fill: currentColor;
}

/*catalog content*******/

.catalog__content {
  min-height: 500px;
}
.catalog__content .container4 {
  display: flex;
}
.container4 {
  /* max-width: 1406px;*/

  padding: 0 10px;

  margin: 0 auto;
}
/*custom__checkbox**************/

.custom__checkbox {
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.custom__checkbox-text {
  color: gray;
  /*font-family: serif;*/
  font-size: 13px;
  padding-left: 15px;
  position: relative;
  transition: color 0.3s;
}
.custom__checkbox-text:hover {
  color: #000;
  transition: color 0.3s;
}
.custom__checkbox-input:checked + span {
  color: #000;
}

.custom__checkbox-input:checked + span::before {
  border-color: #000;
}
.custom__checkbox-input {
  display: none;
}

.custom__checkbox-input:checked::before {
  border-color: #000;
}

.custom__checkbox-input:checked + span::after {
  color: #000;
}

.custom__checkbox-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  border: 2px solid #aaa;
  width: 11px;
  height: 11px;
}

.custom__checkbox-text::after {
  content: '\2713';
  position: absolute;
  left: 2px;
  top: 0;
  color: #aaa;
}

/**catalog__grid******************/

.catalog__grid {
  width: 987px;
  width: 1130px;
  padding-top: 34px;
  padding-bottom: 60px;
}

.catalog-grid__content {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 70px;
}

.catalog__grid-item {
  /*padding-bottom: 16px;*/
  margin-bottom: 79px;
}

[data-grid-colums='3'] .catalog__grid-item {
  width: 31.3%;
}
[data-grid-colums='3'].catalog__grid-item:not(:nth-child(3n)) {
  margin-right: 3%;
}

[data-grid-colums='3'] .catalog__grid-item:nth-last-child(-n + 3) {
  margin-bottom: 0;
}

[data-grid-colums='4'] .catalog__grid-item {
  width: 22.7%;
}

[data-grid-colums='4'].catalog__grid-item:not(:nth-child(4n)) {
  margin-right: 3%;
}

[data-grid-colums='4'] .catalog__grid-item:nth-last-child(-n + 4) {
  margin-bottom: 0;
}

[data-grid-colums='5'] .catalog__grid-item {
  width: 17.6%;
}

[data-grid-colums='5'] .catalog__grid-item:not(:nth-child(5n)) {
  margin-right: 3%;
}

[data-grid-colums='5'] .catalog__grid-item:nth-last-child(-n + 5) {
  margin-bottom: 0;
}

.catalog-props {
  margin-bottom: 15px;
}
.catalog-props__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.catalog-choice {
  padding-bottom: 20px;
  display: none;
}

.custom-select {
  min-width: 115px;
  position: relative;
}

.custom-select__dropdown {
  display: none;
  position: absolute;
  left: 0;
  width: 100%;
  padding-bottom: 10px;
  top: calc(100%+2px);
  z-index: 20;
  width: 100%;
  background-color: #fff;
}

.custom-select__item {
  cursor: pointer;
  transition: color 0.3s;
}

.custom-select__item:hover {
  color: rgb(234, 234, 234);
  transition: color 0.3s;
}
.custom-select__item:not(:last-child) {
  margin-bottom: 10px;
}

.custom-select__top {
  position: relative;
  padding-right: 32px;
  padding-bottom: 12px;
  /*  color: #151515;*/
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e5e7;
  cursor: pointer;
}

.custom-select__top::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -6px;

  width: 10px;
  height: 10px;
  transform: translateY(-50%);
  background-image: url('../images/arrows.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.custom-select--open .custom-select__top::after {
  transform: translateY(-50%) rotate(180deg);
}

.custom-select.custom-select__dropdown {
  display: block;
}
/*
.catalog-props select{
   display: none;
}*/

.btn-reset {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
}
.catalog__columns-btn {
  padding: 0 5px;
  color: gray;
  font-size: 10px;
}
.catalog__columns-btn--current {
  position: relative;
  font-size: 15px;
}

.catalog__columns-btn--current::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: #000;
  transition: width 0.15s;
}
.catalog__columns-btn--current::before {
  width: 100%;
  transition: width 0.15s;
}
.catalog-calumns,
.catalog__columns-btn {
  font-size: 10px;
  color: gray;
}

.catalog-calumns,
.catalog__columns-btn:hover {
  color: #000;
}
.catalog__columns,
.catalog__columns-btn--current {
  color: #000;
}

.catalog__columns-btn--current::before {
  opacity: 1;
}

.main-link {
  position: relative;
  font-size: 10px;
  color: #000;
}

/*catalog-colums************/

.catalog-colums {
  display: flex;
  align-items: center;

  color: #151515;
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
.catalog-colums__item,
.catalog-colums__item:not(:last-child) {
  margin-right: 5px;
}
.catalog-calumns__text {
  margin-right: 3px;
}

.catalog-colums-list {
  display: flex;
  align-items: center;
}

.main-link {
  position: relative;
  font-size: 10px;
  color: #7c7676;
}

.main-link::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -7px;
  opacity: 0;

  transition: opacity 0.15s;
  width: 100%;
  height: 2px;
  background-color: #000;
}

.main-link--current::before {
  opacity: 1;

  transition: opacity 0.15s;
}
.main-link:hover::before {
  opacity: 1;

  transition: opacity 0.15s;
}

.catalog__columns-btn--current {
  color: #000;
}

.catalog__columns-btn--current::before {
  opacity: 1;
}

/*catalog choice****************/
.catalog-choice {
  font-size: 0;
  display: none;
}
.catalog-choice__clear {
  position: relative;

  font-size: 13px;
  font-weight: 500;
}

.catalog-choice__clear::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: currentColor;
  opacity: 1;
  transition: opacity 0.15s;
}
.catalog-choice__item {
  width: 110px;
  height: 24px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 12px;
  background-color: #eee;
  color: #454545;
  font-family: serif;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;

  transition:
    background-color 0.3s,
    color 0.3s;
}

.catalog-choice svg {
  width: 8px;
  height: 9px;
}

.catalog-choice__item svg {
  width: 8px;
  height: 9px;
  fill: currentColor;
  margin-left: 5px;
  pointer-events: none;
}

.catalog-choice__item:hover {
  transition: color 0.3s;
  color: #fff;
  background-color: black;
  transition:
    background-color 0.3s,
    color 0.3s;
}
</style>
