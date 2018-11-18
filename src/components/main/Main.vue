<template>
  <div class="container">

    <div class="row">
      <div class="header col-md-12">
        <div class="col-md-2">
          <div class="filter-button" @click="filterModalOpen">필&nbsp;&nbsp;터</div>
        </div>
        <div class="col-md-8"></div>
        <div class="col-md-2">
          <div class="ordering-item"
               :class="{'selected': curOrder === order.id }"
               v-for="(order, idx) in orders" :key="'order-'+idx"
               @click="ordering(order.id)"><span :class="{'under-line': curOrder === order.id }">{{order.name}}</span>
          </div>
        </div>
      </div>

      <div class="contents col-md-12"
           v-for="(card, idx) in cards" :key="'card-'+idx">
        <div class="content col-md-12">
          <div class="content-category-wrapper col-md-12">
            <div class="category col-md-1">{{category(card.category_no)}}</div>
            <div class="col-md-10"></div>
            <div class="card-no col-md-1">{{ card.no }}</div>
          </div>
          <div class="content-info-wrapper col-md-12">
            <div class="col-md-8"></div>
            <div class="col-md-2">
              <div class="email">{{ card.email }}</div>
            </div>
            <div class="col-md-2">
              <div class="date">{{ card.updated_at }}</div>
            </div>
          </div>
          <div class="inner-content-wrapper col-md-12">
            <div class="content-title col-md-12">
              <div>{{ card.title }}</div>
            </div>
            <div class="content-content col-md-12">
              <div>{{ card.contents }}</div>
            </div>
          </div>
        </div>

        <div class="ad col-md-12"
             v-if="(idx+1) % 4 === 0 && ads[adIdx(idx)] !== undefined">
          <div class="col-md-12">
            <div class="sponcered"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
              Sponcered
            </div>
          </div>
          <div class="col-md-12">
            <div class="adImage col-md-4">
              <div :style="{
                      backgroundImage: 'url(\'' + 'http://comento.cafe24.com/public/images/'+ ads[adIdx(idx)].img + '\')',
                      width: '100%',
                      height: '200px',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      marginBottom: '15px',
                      opacity: '0.9'
          }"></div>
            </div>
            <div class="ad-content-wrapper col-md-8">
              <div class="ad-title col-md-12">
                <div>{{ ads[adIdx(idx)].title }}</div>
              </div>
              <div class="ad-content col-md-12">
                <div>{{ ads[adIdx(idx)].contents }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <sweet-modal ref="modal">
        <div class="modal-title col-md-12">필터</div>
        <div class="modal-contents col-md-12">
          <div class="checkbox col-md-4"
               v-for="(filter,idx) in filters" :key="'filter-'+idx">
            <label :for=filter.name>
            <input type="checkbox"
                   :id="filter.name"
                   :value="filter.no"
                   v-model="filterList">
            {{filter.name}}
            </label>
          </div>
        </div>
        <div class="col-md-9"></div>
        <div class="col-md-3">
          <div class="modal-button" @click="saveFilter">저장</div>
        </div>
      </sweet-modal>
    </div>
  </div>
</template>

<script>
  import {SweetModal} from 'sweet-modal-vue'

  export default {
    name: "Main",
    components: [
      SweetModal,
    ],
    data() {
      return {
        filters: [],
        orders: [
          {id: 'asc', name: '오름차순'},
          {id: 'desc', name: '내림차순'}
        ],
        curOrder: 'asc',
        cards: [],
        ads: [],
        // adIdx: 0,
        page: 1,
        filterList: [],
        noMoreAds: false,
        noMoreCard: false
      }
    },
    created() {
      // get filter
      this.getFilters();
      // get cards
      this.getCards();
      // get ads
      this.getAds();

      // ex11 호환 문제로 jQuery .scroll() 사용
      let vm = this; // $(window) 의 this 로 인해 Main vm 을 따로 할당
      $(window).scroll(function (e) {
        vm.infiniteScroll($(this).scrollTop() + $(this).innerHeight(), vm.$root.$el.scrollHeight);
      });
    },

    watch: {
      'cards'(n) {
        this.ordering(this.curOrder);
      }
    },

    methods: {
      filterModalOpen() {
        this.$refs.modal.open()
      },
      filterModalClose() {
        this.$refs.modal.close()
      },

      getFilters() {
        if (this.$store.getters.filter !== 0) this.filterList = this.$store.getters.filter;

        console.log('this.filterList', this.filterList);

        this.axios.get('http://comento.cafe24.com/category.php')
          .then(
            (response) => {
              // console.log(response.data);
              this.filters = response.data.list;
            }
          ).catch(
          (error) => console.log(error)
        )
      },
      getCards(next) {
        if (next) this.page++;

        if (this.filterList.length === 0) {
          this.axios.get(`http://comento.cafe24.com/request.php?page=${this.page}&ord=asc`)
            .then(
              (response) => {
                // console.log(response.data);
                this.cards.push.apply(this.cards, response.data.list);
              }
            ).catch(
            (error) => console.log(error)
          )
        }

        else if (this.filterList.length > 0) {

          for (let i = 0; i < this.filterList.length; i++) {
            this.axios.get(`http://comento.cafe24.com/request.php?page=${this.page}&ord=asc&category=${this.filterList[i]}`)
              .then(
                (response) => {
                  // console.log(response.data);
                  if (response.data.list.length !== 0) {
                    this.cards.push.apply(this.cards, response.data.list);
                    this.noMoreCard = true;
                  }
                }
              ).catch(
              (error) => console.log(error)
            )
          }

          this.ordering(this.curOrder);

        }
      },
      getAds() {
        this.axios.get(`http://comento.cafe24.com/ads.php?page=1&limit=100`)
          .then(
            (response) => {
              this.ads.push.apply(this.ads, response.data.list);
            }
          ).catch(
          (error) => console.log(error)
        )
      },
      infiniteScroll(scrollTop, scrollHeight) {
        if (scrollTop === scrollHeight) {
          this.getCards(true);
        }
      },
      adIdx(idx) {
        if (((idx + 1) / 4) > this.ads.length) return parseInt((Math.random() * this.ads.length + 1));
        return (idx + 1) / 4;
      },
      ordering(order) {
        if (order === 'asc' && order !== this.curOrder) {
          this.cards.sort((a, b) => {
            return a.no - b.no
          });
          this.curOrder = 'asc';
        }
        if (order === 'desc' && order !== this.curOrder) {
          this.cards.sort((a, b) => {
            return b.no - a.no
          });
          this.curOrder = 'desc';
        }
      },
      saveFilter() {
        this.setFilter();
        this.filterModalClose();
      },
      setFilter() {
        this.$store.commit('setFilter', this.filterList);
        this.cards = [];
        this.getCards();
      },
      category(category_no) {
        if (category_no === '1') return 'apple';
        if (category_no === '2') return 'banana';
        if (category_no === '3') return 'coconut';
      }
    }
  }
</script>

<style scoped lang="less">
  .container {

  }

  .header {
    margin: 30px 0px 30px 0px;

    div {
      height: 40px;
    }

    .filter-button {
      text-align: center;
      vertical-align: middle;
      line-height: 40px;
      background-color: #00c854;
      font-weight: 600;
      color: #ffffff;
      border-radius: 1px;
    }

    .ordering-item {
      width: 50%;
      display: inline-block;
      text-align: end;
      vertical-align: middle;
      line-height: 42px;
    }

    .selected {
      font-weight: 700;
      color: #00c854;
    }

    .under-line {
      border-bottom: 2px solid #00c854;
    }
  }

  .contents {

    .content {
      border: 1px solid #EEEEEE;
      border-top: 2px solid #282929;
      margin: 0px 0px 30px 0px;
      padding: 0px;
      border-radius: 2px;

      .content-category-wrapper {

        div {
          height: 50px;
          border-bottom: 1px solid #EEEEEE;
        }

        .category {
          text-align: center;
          vertical-align: middle;
          line-height: 50px;
          font-weight: 500;
          color: #00c854;
        }

        .card-no {
          text-align: end;
          vertical-align: middle;
          line-height: 40px;
          font-weight: 400;
          color: #6e6e6e;
        }
      }

      .content-info-wrapper {
        height: 40px;
        margin-bottom: 3px;

        .email, .date {
          font-size: 14px;
          color: #878a8e;
          text-align: end;
          vertical-align: middle;
          line-height: 40px;
        }
      }

      .inner-content-wrapper {
        margin-bottom: 40px;

        .content-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .content-content {
          font-size: 15px;
          line-height: 1.6;
        }
      }
    }

    .ad {
      border: 1px solid #e1e1e1;
      margin: 0px 0px 30px 0px;
      padding: 0px;
      background-color: #fdfdfd;
      border-radius: 2px;

      .adImage {
        padding: 0px;
      }

      .sponcered {
        height: 30px;
        font-weight: 500;
        color: #BBBBBB;
        vertical-align: middle;
        line-height: 30px;
      }

      .ad-content-wrapper {

        .ad-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .ad-content {
          font-size: 14px;
          line-height: 1.6;
        }

      }

    }

  }

    /* modal */
    .modal-title {
      margin-bottom: 40px;
      text-align: left;
      font-weight: 700;
    }

    .sweet-modal-overlay {
      background-color: rgba(0, 0, 0, 0.75);
    }

    .modal-contents {
      margin-bottom: 20px;
    }

    .checkbox {
      margin-top: 0px;
    }

    .modal-button {
      color: #fff;
      background-color: #00c854;
      border-color: #2e6da4;
      border: 0px solid;
      border-radius: 1px;
      width: 100%;
      height: 40px;
      text-align: center;
      vertical-align: middle;
      line-height: 40px;
      margin-bottom: 25px;
    }
</style>
