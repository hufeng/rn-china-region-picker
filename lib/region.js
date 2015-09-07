/**
 * 省市区级联
 */
var React = require('react-native');
var webapi = require('./webapi');
var win = require('Dimensions').get('window')
var HEIGHT = win.height;
var WIDTH = win.width;


var {
  View,
  Text,
  Animated,
  PickerIOS,
  StyleSheet,
  TouchableOpacity
} = React;

//just do nothing
var noop = () => {};


var Region = React.createClass({
  getDefaultProps() {
    return {
      //默认不显示
      visible: false,
      //默认显示北京(省)
      selectedProvince: '110000',
      //默认显示北京(市)
      selectedCity: '110100',
      //默认显示(区)
      selectedArea: '110101',
      //确定
      onSubmit: noop,
      //取消
      onCancel: noop
    }
  },


  /**
   * 改变新属性
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible != this.props.visible) {
      //开始动画
      Animated.spring(this.state.topValue, {
        toValue: nextProps.visible ? HEIGHT : 0,
        friction: 10,
        tension: 30
      }).start();
    }
  },


  componentWillMount() {
    //开始动画
    Animated.spring(this.state.topValue, {
      toValue: this.props.visible ? HEIGHT : 0,
      friction: 10,
      tension: 30
    }).start();
  },


  /**
   * 初始化状态
   */
  getInitialState() {
    return {
      //距离顶部的距离
      topValue: new Animated.Value(0),
      //省
      province: [],
      //市
      city: [],
      //地区
      area: [],
      //选中的省
      selectedProvince: this.props.selectedProvince,
      //选中的市
      selectedCity: this.props.selectedCity,
      //选中的地区
      selectedArea: this.props.selectedArea
    }
  },


  componentDidMount() {
    webapi
      .fetchRegionData()
      .then((data) => {
        //cache it.
        this._data = data;

        //过滤省
        var province = this._filter('086');
        this._selectedProvinceName = this._data[this.state.selectedProvince][0];

        //过滤省对于的市
        var city = this._filter(this.state.selectedProvince);

        //市的名字
        this._selectedCityName = '';
        if (this.state.selectedCity) {
          this._selectedCityName = this._data[this.state.selectedCity][0];
        }

        //过滤第一个市对应的区
        var area = [];
        if (this.state.selectedCity) {
          area = this._filter(this.state.selectedCity);

          this._selectAreaName = '';
          if (this.state.selectedArea) {
            this._selectAreaName = this._data[this.state.selectedArea][0];
          }
        }

        this.setState({
          province: province,
          city: city,
          area: area
        });
      });
  },


  render() {
    return (
      <Animated.View ref='region' style={[styles.container, {
          top: this.state.topValue.interpolate({
            inputRange: [0, HEIGHT],
            outputRange: [HEIGHT, 0]
          })
        }]}>
        <View style={styles.region}>
          {/*头部按钮*/}
          <View style={styles.nav}>
            <TouchableOpacity onPress={this._handleCancel}>
              <Text style={styles.text}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._handleSubmit}>
              <Text style={styles.text}>确认</Text>
            </TouchableOpacity>
          </View>

          {/*省市区级联*/}
          <View style={styles.regionArea}>
            {/*省*/}
            <PickerIOS
              style={styles.regionItem}
              onValueChange={this._handleProvinceChange}
              selectedValue={this.state.selectedProvince}>
              {this.state.province.map((v, k) => {
                return (
                  <PickerIOS.Item value={v[0]} label={v[1]} key={k}/>
                );
              })}
            </PickerIOS>

            {/*市*/}
            <PickerIOS
              style={styles.regionItem}
              onValueChange={this._handleCityChange}
              selectedValue={this.state.selectedCity}>
              {this.state.city.map((v, k) => {
                return (<PickerIOS.Item value={v[0]} label={v[1]} key={k}/>);
              })}
            </PickerIOS>

            {/*区*/}
            <PickerIOS
              style={styles.regionItem}
              onValueChange={this._handleAreaChange}
              selectedValue={this.state.selectedArea}>
              {this.state.area.map((v, k) => {
                return (<PickerIOS.Item value={v[0]} label={v[1]} key={k}/>);
              })}
            </PickerIOS>
          </View>
        </View>
      </Animated.View>
    );
  },


  /**
   * 处理省的改变
   */
  _handleProvinceChange(province) {
    //设置选中的省的名称
    this._selectedProvinceName = this._data[province][0];

    if (__DEV__) {
      console.log('省发生改变:', province, this._selectedProvinceName);
    }

    //过滤出改变后，省对应的市
    var city = this._filter(province);
    //省下面没有市，包括台湾，香港，澳门
    if (city.length === 0) {
      this._selectAreaName = '';
      this._selectedCityName = '';

      this.setState({
        selectedProvince: province,
        selectedCity: '',
        selectedArea: '',
        city: [],
        area: []
      });
    } else {
      this._selectedCityName = city[0][1];
      //过滤区域
      var area = this._filter(city[0][0]);
      //区域名称
      this._selectAreaName = area[0][1];

      this.setState({
        selectedProvince: province,
        selectedCity: city[0][0],
        selectedArea: area[0][0],
        city: city,
        area: area,
      });
    }
  },


  /**
   * 处理市改变
   */
  _handleCityChange(city) {
    this._selectedCityName = this._data[city][0];

    if (__DEV__) {
      console.log('市发生改变:', city, this._selectedCityName);
    }

    //过滤出市变化后，区
    var area = this._filter(city);
    if (area.length === 0) {
      this._selectAreaName = '';
      this.setState({
        selectedCity: city,
        selectedArea: '',
        area: []
      });
    } else {
      this._selectAreaName = area[0][1];

      this.setState({
        selectedCity: city,
        selectedArea: area[0][0],
        area: area
      });
    }
  },


  /**
   * 处理区域改变
   */
  _handleAreaChange(area) {
    this._selectAreaName = this._data[area][0];

    if (__DEV__) {
      console.log('区域发生改变:', area, this._selectAreaName);
    }

    this.setState({
      selectedArea: area
    })
  },


  /**
   * 处理取消
   */
  _handleCancel() {
    this.props.onCancel()
  },


  /**
   * 处理确定
   */
  _handleSubmit() {
    this.props.onSubmit({
      province: this.state.selectedProvince,
      city: this.state.selectedCity,
      area: this.state.selectedArea,
      provinceName: this._selectedProvinceName,
      cityName: this._selectedCityName,
      areaName: this._selectAreaName
    })
  },


  /**
   * 根据pid查询子节点
   */
  _filter(pid) {
    var result = [];

    for (var code in this._data) {
      if (this._data.hasOwnProperty(code)
          && this._data[code][1] === pid) {
        result.push([code, this._data[code][0]]);
      }
    }

    return result;
  }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    width: WIDTH,
    height: HEIGHT,
    left: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nav: {
    height: 60,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'blue',
    flexDirection: 'row'
  },
  text: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  region: {
    flex: 1,
    marginTop: HEIGHT/2,
    backgroundColor: '#FFF'
  },
  regionArea: {
    flexDirection: 'row'
  },
  regionItem: {
    flex: 1
  }
});


module.exports = Region;
