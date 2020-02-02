<template>
  <div id="app">
    <el-button v-show="mapType==='city'" size="samll" @click="drawMap">返回全国</el-button>
    <div class="china-map" id="china-map" style="height: 300px"></div>
  </div>
</template>

<script>
// import overall from './data/overall.json'
import area from './data/area.json'
// import 'echarts/map/js/province/chongqing'
// 全量引入，就不需要像上面一样一个一个地引入 https://segmentfault.com/a/1190000019723837
const rjs = require.context("echarts/map/js/province");
rjs.keys().forEach(rjs);
export default {
  name: "app",
  data() {
    return {
      mapType: 'china',
      chartChina: null
    }
  },
  mounted() {
    // 初始化
    const chartContainer = document.getElementById("china-map")
    this.chartChina = this.$echarts.init(chartContainer)
    window.onresize = this.chartChina.resize
    this.chartChina.on('click', (params) => {
      this.drawCities(params)
      this.mapType = 'city'
    })
    this.drawMap()
  },
  beforeDestroy() {
    this.chartChina = null
  },
  methods: {
    randomData() {
      return Math.round(Math.random() * 500);
    },
    drawMap() {
      this.mapType = 'china'
      let data = []
      area.map(item => {
        data.push({
          name: item.provinceShortName,
          value: item.confirmedCount
        })
      })      
      let optionMap = this.getOptions(false, data);

      this.chartChina.setOption(optionMap);
    },
    drawCities(params) {
      console.log(params)
      if (this.mapType !== 'china') return
      let index = area.findIndex(item => item.name === params.name)
      let data = []
      if (index > -1) {
        let cities = area[index]['cities']
        console.log(cities)
        cities.map(item => {
          data.push({
            name: item.fullCityName,
            value: item.confirmedCount
          })
        })
      } else {
        console.log('未找到该城市数据')
        return
      }
      let optionMap = this.getOptions(params, data)
      this.chartChina.setOption(optionMap)
    },
    getOptions(province, data) {
      // 绘制图表
      var optionMap = {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            let tooltip = ''
            tooltip += params.name + '<br>确诊人数：' + params.value
            return tooltip
          },
          align: 'left'
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
          text: ['高', '低'],
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
          orient: province ? 'horizontal' : 'vertical',
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
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.china-map {
  margin: 0 auto;
}
</style>
