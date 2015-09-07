# rn-china-region-picker
中国的省市区的多重级联react-native组件


# show
![button](https://raw.githubusercontent.com/hufeng/rn-china-region-picker/master/images/region.png)


# usage
```javascript
  var Region = require('rn-china-region-picker');

  <Region
    visible={false} //true展示，false不展示
    selectedProvince={'110000'} //初始化省，不传默认也是北京
    selectedCity={'110100'} //初始化市，不传默认也是北京
    selectedArea={'110101'} //初始化区，不传默认为东城区
    onSubmit={(params) => console.log(params)}
    onCancel={() => console.log('cancel')}
  />
```
