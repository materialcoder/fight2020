<template>
  <div id="app">
    <div class="card">
      <h2 class="title">
        统计 {{city ? '· ' + city : ''}}
        <span>截止时间：{{overall.modifyTime | formatTime}}（数据来源：丁香园）</span>
      </h2>
      <div class="content">
        <div class="item">
          <div class="item-count confirmed">{{overallData.confirmedCount || '--'}}</div>
          <div class="item-name">确诊</div>
        </div>
        <div class="item">
          <div class="item-count suspected">{{overallData.suspectedCount || '--'}}</div>
          <div class="item-name">疑似</div>
        </div>
        <div class="item">
          <div class="item-count serious">{{overallData.seriousCount ||'--'}}</div>
          <div class="item-name">重症</div>
        </div>
        <div class="item">
          <div class="item-count dead">{{overallData.deadCount || '--'}}</div>
          <div class="item-name">死亡</div>
        </div>
        <div class="item">
          <div class="item-count cured">{{overallData.curedCount || '--'}}</div>
          <div class="item-name">治愈</div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="title">
        疫情地图 {{city ? '· ' + city : ''}}
        <span style="float:right">
          <el-button v-show="mapType==='city'" type="primary" size="mini" @click="drawMap">返回全国</el-button>
        </span>
      </h2>
      <div class="content">
        <div class="china-map" id="china-map" style="width:100%;height: 300px"></div>
      </div>
      <el-table
        :data="area"
        row-key="locationId"
        class="detail-table"
        :tree-props="{'children': 'cities', 'hasChildren': 'hasChildren'}">
        <el-table-column prop="name" label="地区" ></el-table-column>
        <el-table-column prop="confirmedCount" label="确诊" align="center"></el-table-column>
        <el-table-column prop="deadCount" label="死亡" align="center"></el-table-column>
        <el-table-column prop="curedCount" label="治愈" align="center"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import overall from "./data/overall.json";
import area from "./data/area.json";
// import 'echarts/map/js/province/chongqing'
// 全量引入，就不需要像上面一样一个一个地引入 https://segmentfault.com/a/1190000019723837
const rjs = require.context("echarts/map/js/province");
rjs.keys().forEach(rjs);
export default {
  name: "app",
  filters: {
    formatTime(val) {
      let date = new Date(val);
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let hour = ("0" + date.getHours()).slice(-2);
      let minutes = ("0" + date.getMinutes()).slice(-2);
      let seconds = ("0" + date.getSeconds()).slice(-2);
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minutes +
        ":" +
        seconds
      );
    }
  },
  data() {
    return {
      area,
      overall,
      overallData: overall,
      mapType: "china",
      chartChina: null,
      city: ''
    };
  },
  mounted() {
    // 初始化
    const chartContainer = document.getElementById("china-map");
    this.chartChina = this.$echarts.init(chartContainer);
    window.onresize = this.chartChina.resize;
    this.chartChina.on("click", params => {
      this.drawCities(params);
      this.mapType = "city";
    });
    this.drawMap();
  },
  beforeDestroy() {
    this.chartChina = null;
  },
  methods: {
    randomData() {
      return Math.round(Math.random() * 500);
    },
    drawMap() {
      this.mapType = "china";
      this.city = '';
      this.overallData = overall
      let data = [];
      area.map(item => {
        data.push({
          name: item.provinceShortName,
          value: item.confirmedCount,
          suspectedCount: item.suspectedCount,
          curedCount: item.curedCount,
          deadCount: item.deadCount
        });
      });
      let optionMap = this.getOptions(false, data);

      this.chartChina.setOption(optionMap);
    },
    drawCities(params) {
      console.log(params);
      if (this.mapType !== "china") return;
      let index = area.findIndex(item => item.name === params.name);
      let data = [];
      if (index > -1) {
        let cities = area[index]["cities"];
        console.log(cities);
        this.city = params.name
        this.overallData = area[index]
        cities.map(item => {
          data.push({
            name: item.fullCityName,
            value: item.confirmedCount,
            suspectedCount: item.suspectedCount,
            curedCount: item.curedCount,
            deadCount: item.deadCount
          });
        });
      } else {
        console.log("未找到该城市数据");
        return;
      }
      let optionMap = this.getOptions(params, data);
      this.chartChina.setOption(optionMap);
    },
    getOptions(province, data) {
      // 绘制图表
      var optionMap = {
        tooltip: {
          trigger: "item",
          formatter: params => {
            let tooltip = "";
            tooltip += params.name + "<br>确诊人数：" + params.value
                      + '<br>疑似人数：' + params.data.suspectedCount
                      + '<br>死亡人数：' + params.data.deadCount
                      + '<br>治愈人数：' + params.data.curedCount;
            return tooltip;
          },
          align: "left"
        },
        // legend: {
        //   orient: "vertical",
        //   left: "left",
        //   data: [""]
        // },
        visualMap: {
          show: true,
          type: "piecewise",
          min: 0,
          max: 2000,
          align: "right",
          text: ["高", "低"],
          top: province ? 0 : "40%",
          right: 0,
          left: province ? 0 : "auto",
          inRange: {
            color: ["#ffc0b1", "#ff8c71", "#ef1717", "#9c0505"]
          },
          pieces: [
            { min: 1000 },
            { min: 500, max: 999 },
            { min: 100, max: 499 },
            { min: 10, max: 99 },
            { min: 1, max: 9 }
          ],
          orient: province ? "horizontal" : "vertical",
          showLabel: province ? false : true,
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 10
          }
        },
        selectedMode: "single",
        series: [
          {
            name: "确诊人数",
            type: "map",
            mapType: province ? province.name : "china",
            zoom: 1.2,
            // silent: province ? true : false,
            showLegendSymbol: false,
            label: {
              normal: {
                show: true,
                fontSize: 10
              },
              emphasis: {
                show: true
              }
            },
            data
          }
        ]
      };
      return optionMap;
    }
  }
};
</script>

<style lang="scss">
body {
  background: #ccc;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}
.confirmed {
  color: #c93344;
}
.suspected {
  color: #ffb200;
}
.serious {
  color: #9c0505;
}
.cured {
  color: #07764b;
}
.dead {
  color: #5b5b5b;
}
.card {
  padding: 10px 20px;
  background: #fff;
  margin-bottom: 10px;
  .title {
    padding-left: 4px;
    height: 38px;
    line-height: 38px;
    border-left: 4px solid #409fee;
    span {
      font-size: 14px;
      font-weight: normal;
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .item {
      // width: 120px;
      flex: 1 1;
      margin: 10px;
      padding: 10px 0;
      line-height: 1.5;
      text-align: center;
      background: #eee;
      border-radius: 4px;
      .item-name {
        font-size: 14px;
      }
      .item-count {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}

.detail-table .el-table__header {
  th > .cell {
    color: #000;
    font-size: 16px;
  }
  th:nth-child(1) {
    background: #5b5b5b;
  }
  th:nth-child(2) {
    background: #c93344;
  }
  th:nth-child(3) {
    background: #5b5b5b;
  }
  th:nth-child(4) {
    background: #07764b;
  }
}

.china-map {
  margin: 0 auto;
}
</style>
