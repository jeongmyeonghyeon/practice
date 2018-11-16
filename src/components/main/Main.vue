<template>
  <div class="main-container">

    <div class="main-header-container">
      <div class="main-header-wrapper">
        <div class="filter-button" @click="filterModalOpen">필터</div>
        <div class="ordering-warpper">
          <div class="ordering-item"
               :class="{'selected': curOrder === order.id }"
               v-for="(order, idx) in orders" :key="'order-'+idx"
               @click="ordering(order.id)">{{order.name}}</div>
        </div>
      </div>
    </div>

    <div class="main-content-container">
      <div class="main-content-wrapper">
        <div class="main-content-item"
          v-for="(card, idx) in cards" :key="'card-'+idx">
          <div class="main-content-item-header">
            <div class="category_no">{{category(card.category_no)}}</div>
            <div class="no">{{ card.no }}</div>
          </div>
          <div class="main-content-item-body">
            <div class="main-content-item-body-top">
              <div class="email">{{ card.email }}</div>
              <div style="padding: 0px 8px;font-size: 14px;">|</div>
              <div class="updated_at">{{ card.updated_at }}</div>
            </div>
            <div class="main-content-item-body-bottom">
              <div class="title">{{ card.title }}</div>
              <div class="contents">{{ card.contents }}</div>
            </div>
          </div>
          <!-- 광고 4번째 인덱스마다 광고컨텐츠 1개 넣기-->
          <div v-if="ads && idx !== 0 && (idx+1) % 4 === 0">
            <span>Sponcered</span>
            <img :src="'http://comento.cafe24.com/public/images/' + ads[adIdx(idx)].img" alt="">
            <div>광고제목 {{ ads[adIdx(idx)].title }}</div>
            <div>광고내용 {{ ads[adIdx(idx)].contents }}</div>
            <div style="height: 100px;"></div>
          </div>
        </div>
      </div>
    </div>

    <sweet-modal ref="modal" title="필터">
      <div v-for="(filter,idx) in filters" :key="'filter-'+idx">
        <input type="checkbox" :id="filter.name" :value="filter.no" v-model="filterList">
        <label :for="filter.name">{{filter.name}}</label>
      </div>
      <div slot="button" @click="saveFilter">저장</div>
    </sweet-modal>
  </div>
</template>

<script>
  import {SweetModal} from 'sweet-modal-vue/src/plugin.js'

  export default {
    name: "Main",
    components: [
      SweetModal
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
      'cards'(n){
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
        if(this.$store.getters.filter !== 0) this.filterList = this.$store.getters.filter;

        console.log('this.filterList', this.filterList);

        this.axios.get('http://comento.cafe24.com/category.php')
          .then(
            (response) => {
              console.log(response.data);
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
                console.log(response.data);
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
                  console.log(response.data);
                  if(response.data.list.length !== 0) {
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
        if (((idx+1)/4) > this.ads.length) return parseInt((Math.random() * this.ads.length + 1));
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
@main-color: #00c854;

.main-container {
  width: 768px;
  margin: 0 auto;
}

.main-header-container {
  width: 100%;
  padding: 20px 0px;
}

.main-header-wrapper {
  display: flex;
  justify-content: space-between;

  .filter-button {
    padding: 8px 45px;
    background-color: #00c854;
    font-size: 15px;
    font-weight: 600;
    color: #EEEEEE;
  }

  .ordering-warpper {
    display: flex;

    .ordering-item {
      font-size: 15px;
      padding: 8px 8px;
    }

  }
}

.main-content-container {
  width: 100%;
  font-size: 16px;

  .main-content-item {
    border-top: 2px solid #222222;
    border-right: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    border-left: 1px solid #dddddd;
    margin: 0px 0px 8px 0px;

    .main-content-item-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #dddddd;
      padding: 12px 0px;
      margin: 0px 16px;

      .no {
        font-size: 14px;
        color: #444444;
      }
    }

    .main-content-item-body {

      .main-content-item-body-top {
        display: flex;
        padding: 24px 12px 20px 12px;

        .email {
          font-size: 15px;
          color: #555555;
        }

        .updated_at {
          font-size: 15px;
          color: #555555;
        }

      }

      .main-content-item-body-bottom {
        padding: 0px 12px 38px 12px;

        .title {
          font-weight: 700;
          color: #00c854;
          font-size: 20px;
          margin: 0px 0px 5px;
        }

        .contents {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }

  }
}

.selected {
  color: #00c854;
}
</style>
