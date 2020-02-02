const fs = require('fs')
const axios = require('axios')
const _ = require('lodash')
const pinyin = require('pinyin')
const provinces = require('province-city-china/dist/province')
const city = require('province-city-china/dist/data')
const provinceByName = _.keyBy(provinces, p => p.name.slice(0, 2))
const citiesByProvince = _.groupBy(city, 'province')

const getCitiesByProvince = name => {
  const provinceName = name.slice(0, 2)
  const code = _.get(provinceByName, [provinceName, 'province'])
  return citiesByProvince[code] || []
}

const loadCityList = async html => {
  const cityList = html.match(/window.getAreaStat = (.*?)}catch/)[1]
  const provinces = JSON.parse(cityList).map(p => {
    if (p.provinceShortName === '陕西') {
      p.pinyin = 'shanxi1'
    } else if (p.provinceShortName === '重庆') {
      p.pinyin = 'chongqing'
    } else if (p.provinceShortName === '西藏') {
      p.pinyin ='xizang'
    }
    const cities = getCitiesByProvince(p.provinceName)
    const citiesByName = _.keyBy(cities.reverse(), city => city.name.slice(0, 2))
    return {
      pinyin: pinyin(p.provinceShortName, {
        style: pinyin.STYLE_NORMAL
      }).map(x => x[0]).join(''),
      name: p.provinceShortName,
      ...p,
      cities: p.cities.map(city => {
        let fullCityName = city.cityName
        const cityName = city.cityName.slice(0, 2)
        if (citiesByName[cityName]) {
          fullCityName = citiesByName[cityName].name
        }
        return {
          ...city,
          fullCityName
        }
      })
    }
  })
  fs.writeFileSync('./src/data/area.json', JSON.stringify(provinces))
}

const loadOverAll = async html => {
  const overall = html.match(/window.getStatisticsService = (.*?)}catch/)[1]
  fs.writeFileSync('./src/data/overall.json', overall)
}

const loadCountries = async html => {
  const countries = html.match(/window.getListByCountryTypeService2 = (.*?)}catch/)[1]
  fs.writeFileSync('./src/data/countries.json', countries)
}

function getData() {
  return axios.request('https://3g.dxy.cn/newh5/view/pneumonia').then(({ data: html }) => {
    return Promise.all([
      loadCityList(html),
      loadOverAll(html),
      loadCountries(html)
    ])
  })
}

console.log('开始获取数据')
getData()
console.log('获取数据完成')